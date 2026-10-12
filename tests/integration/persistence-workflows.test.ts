import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { awardXpAndRecordActivity, XP_RULES } from '@/lib/gamification';
import { finalizeExamAttemptIdempotent } from '@/lib/exam-service';
import { resolveNextQuestionStatus } from '@/lib/question-workflow';

describe('Integração PostgreSQL & Prisma — Fluxos Reais de Persistência e Idempotência', () => {
  const testRunId = `int-${Date.now()}`;
  const createdUserIds: string[] = [];
  const createdQuestionIds: string[] = [];

  afterAll(async () => {
    for (const qId of createdQuestionIds) {
      await prisma.question.deleteMany({ where: { id: qId } });
    }
    for (const uId of createdUserIds) {
      await prisma.userProfile.deleteMany({ where: { id: uId } });
    }
  });

  it('1. Cadastra usuário, persiste perfil STUDENT e verifica hash scrypt de senha', async () => {
    const studentRole = await prisma.role.findUnique({
      where: { code: 'STUDENT' },
    });
    expect(studentRole).not.toBeNull();

    const email = `aluno.${testRunId}@ctfl.local`;
    const passwordHash = hashPassword('SenhaSegura123!');

    const user = await prisma.userProfile.create({
      data: {
        email,
        fullName: 'Estudante Teste Integração',
        passwordHash,
        role: 'STUDENT',
        roleId: studentRole!.id,
      },
    });
    createdUserIds.push(user.id);

    expect(user.role).toBe('STUDENT');
    expect(verifyPassword('SenhaSegura123!', user.passwordHash!)).toBe(true);
    expect(verifyPassword('SenhaErrada999!', user.passwordHash!)).toBe(false);
  });

  it('2. Cria questão autoral em DRAFT, versiona e executa fluxo completo até PUBLISHED', async () => {
    const chapter = await prisma.chapter.findUnique({ where: { number: 1 } });
    const topic = await prisma.topic.findFirst({
      where: { chapterId: chapter!.id },
    });
    const source = await prisma.questionSource.findFirst();
    const admin = await prisma.userProfile.findFirst({
      where: { role: 'ADMIN' },
    });

    expect(chapter).not.toBeNull();
    expect(topic).not.toBeNull();
    expect(source).not.toBeNull();

    const code = `CTFL-INT-${testRunId}`;
    const q = await prisma.question.create({
      data: {
        code,
        statement:
          'Qual é o principal benefício de envolver a equipe de QA desde o refinamento de requisitos?',
        chapterId: chapter!.id,
        topicId: topic!.id,
        learningObjectiveCode: 'FL-1.1.1',
        cognitiveLevel: 'K2',
        difficulty: 'MEDIUM',
        correctOptionLabel: 'A',
        explanation:
          'A prevenção precoce de defeitos reduz o custo de correção ao longo do SDLC.',
        referenceSection: 'Seção 1.1',
        sourceId: source!.id,
        status: 'DRAFT',
        version: 1,
        authorId: admin?.id ?? null,
        options: {
          create: [
            {
              label: 'A',
              content: 'Prevenir defeitos precocemente antes da codificação.',
              isCorrect: true,
              orderIndex: 0,
            },
            {
              label: 'B',
              content: 'Substituir completamente os testes de sistema.',
              isCorrect: false,
              orderIndex: 1,
            },
            {
              label: 'C',
              content: 'Provar que não existem defeitos no software.',
              isCorrect: false,
              orderIndex: 2,
            },
            {
              label: 'D',
              content: 'Aumentar o tempo de entrega das sprints.',
              isCorrect: false,
              orderIndex: 3,
            },
          ],
        },
      },
    });
    createdQuestionIds.push(q.id);
    expect(q.status).toBe('DRAFT');

    // Transição DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED
    const t1 = resolveNextQuestionStatus(q.status, 'SUBMIT_REVIEW');
    const qReview = await prisma.question.update({
      where: { id: q.id },
      data: { status: t1.nextStatus! },
    });
    expect(qReview.status).toBe('IN_REVIEW');

    const t2 = resolveNextQuestionStatus(qReview.status, 'APPROVE');
    const qApproved = await prisma.question.update({
      where: { id: q.id },
      data: { status: t2.nextStatus! },
    });
    expect(qApproved.status).toBe('APPROVED');

    const t3 = resolveNextQuestionStatus(qApproved.status, 'PUBLISH');
    const qPublished = await prisma.question.update({
      where: { id: q.id },
      data: { status: t3.nextStatus! },
    });
    expect(qPublished.status).toBe('PUBLISHED');
  });

  it('3. Concede XP de forma idempotente (proteção contra submissão duplicada) e desbloqueia conquista', async () => {
    const userId = createdUserIds[0];
    const idempotencyKey = `LESSON:${userId}:lesson-test-${testRunId}`;

    const firstAward = await awardXpAndRecordActivity({
      userId,
      eventType: 'LESSON_COMPLETED',
      points: XP_RULES.LESSON_COMPLETED,
      idempotencyKey,
      activityType: 'LESSON_COMPLETED',
      description: 'Concluiu aula de teste de integração',
      referenceId: 'lesson-1',
    });

    expect(firstAward.awarded).toBe(true);
    expect(firstAward.pointsAdded).toBeGreaterThanOrEqual(30);

    const userAfterFirst = await prisma.userProfile.findUniqueOrThrow({
      where: { id: userId },
    });

    // Segunda chamada com mesma chave idempotente NÃO deve duplicar XP
    const duplicateAward = await awardXpAndRecordActivity({
      userId,
      eventType: 'LESSON_COMPLETED',
      points: XP_RULES.LESSON_COMPLETED,
      idempotencyKey,
      activityType: 'LESSON_COMPLETED',
      description: 'Concluiu aula de teste de integração',
      referenceId: 'lesson-1',
    });

    expect(duplicateAward.awarded).toBe(false);
    expect(duplicateAward.pointsAdded).toBe(0);

    const userAfterDuplicate = await prisma.userProfile.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(userAfterDuplicate.totalXp).toBe(userAfterFirst.totalXp);
  });

  it('4. Cria tentativa de simulado, grava respostas, finaliza e bloqueia dupla finalização', async () => {
    const userId = createdUserIds[0];
    const config = await prisma.examConfiguration.findFirst({
      where: { isActive: true },
    });
    const questions = await prisma.question.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      include: {
        chapter: true,
        topic: true,
        options: { orderBy: { orderIndex: 'asc' } },
      },
      take: 5,
    });

    expect(config).not.toBeNull();
    expect(questions.length).toBeGreaterThanOrEqual(5);

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 15 * 60 * 1000);

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        configurationId: config!.id,
        mode: 'CUSTOM',
        status: 'IN_PROGRESS',
        title: 'Simulado Integração Vitest',
        totalQuestions: questions.length,
        durationSeconds: 900,
        startedAt,
        expiresAt,
        configSnapshot: { passingPercent: 60 },
      },
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const eq = await prisma.examQuestion.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          orderIndex: i + 1,
          questionVersion: q.version,
          statementSnapshot: q.statement,
          optionsSnapshot: q.options.map((o) => ({
            displayLabel: o.label,
            originalLabel: o.label,
            content: o.content,
            isCorrect: o.isCorrect,
          })),
          correctDisplayLabel: q.correctOptionLabel,
          explanationSnapshot: q.explanation,
          chapterNumberSnapshot: q.chapter.number,
          topicCodeSnapshot: q.topic.code,
          learningObjectiveSnapshot: q.learningObjectiveCode,
          cognitiveLevelSnapshot: q.cognitiveLevel,
          difficultySnapshot: q.difficulty,
        },
      });

      // Marca todas as respostas com o gabarito correto para testar aprovação
      await prisma.userAnswer.create({
        data: {
          attemptId: attempt.id,
          examQuestionId: eq.id,
          userId,
          questionId: q.id,
          selectedLabel: q.correctOptionLabel,
          isCorrect: true,
          context: 'EXAM',
        },
      });
    }

    const firstFinalize = await finalizeExamAttemptIdempotent(
      attempt.id,
      userId
    );
    expect(firstFinalize.status).toBe('COMPLETED');
    expect(firstFinalize.correctCount).toBe(questions.length);
    expect(firstFinalize.accuracyPercent).toBe(100);
    expect(firstFinalize.passed).toBe(true);

    const userAfterFirstExam = await prisma.userProfile.findUniqueOrThrow({
      where: { id: userId },
    });

    // Segunda chamada idempotente retorna o mesmo resultado sem duplicar XP
    const secondFinalize = await finalizeExamAttemptIdempotent(
      attempt.id,
      userId
    );
    expect(secondFinalize.scorePoints).toBe(firstFinalize.scorePoints);

    const userAfterSecondExam = await prisma.userProfile.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(userAfterSecondExam.totalXp).toBe(userAfterFirstExam.totalXp);
  });
});
