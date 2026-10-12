import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { createExamAttemptSchema } from '@/lib/validations';
import {
  selectQuestionsForExam,
  prepareShuffledOptions,
  InsufficientQuestionBankError,
  type CandidateQuestion,
} from '@/lib/exam-engine';
import type { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = createExamAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            'Parâmetros de geração do simulado inválidos.',
        },
        { status: 400 }
      );
    }

    const {
      mode,
      chapterId,
      topicIds,
      difficulties,
      questionCount,
      applyNonNativeBonus,
    } = parsed.data;

    const config = await prisma.examConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuração padrão de prova não encontrada.' },
        { status: 500 }
      );
    }

    // Buscar questões já vistas pelo estudante para priorizar inéditas
    const pastAnswers = await prisma.userAnswer.findMany({
      where: { userId: user.id },
      select: { questionId: true },
    });
    const pastExamQuestions = await prisma.examQuestion.findMany({
      where: { attempt: { userId: user.id } },
      select: { questionId: true },
    });
    const seenQuestionIds = new Set<string>([
      ...pastAnswers.map((a) => a.questionId),
      ...pastExamQuestions.map((eq) => eq.questionId),
    ]);

    const whereClause: Prisma.QuestionWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
    };

    let title = 'Simulado Completo Oficial CTFL v4.0 (40 Questões)';

    if (mode === 'CHAPTER') {
      if (!chapterId) {
        return NextResponse.json(
          { error: 'Selecione um capítulo para o simulado por capítulo.' },
          { status: 400 }
        );
      }
      whereClause.chapterId = chapterId;
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });
      title = chapter
        ? `Simulado do Capítulo ${chapter.number}: ${chapter.title}`
        : 'Simulado por Capítulo';
    } else if (mode === 'CUSTOM') {
      if (chapterId) whereClause.chapterId = chapterId;
      if (topicIds && topicIds.length > 0) {
        whereClause.topicId = { in: topicIds };
      }
      if (difficulties && difficulties.length > 0) {
        whereClause.difficulty = { in: difficulties };
      }
      title = 'Simulado Personalizado CTFL';
    }

    const dbQuestions = await prisma.question.findMany({
      where: whereClause,
      include: {
        chapter: true,
        topic: true,
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });

    const candidates: CandidateQuestion[] = dbQuestions.map((q) => ({
      id: q.id,
      code: q.code,
      equivalenceGroupId: q.equivalenceGroupId,
      statement: q.statement,
      chapterNumber: q.chapter.number,
      chapterId: q.chapterId,
      topicId: q.topicId,
      topicCode: q.topic.code,
      learningObjectiveCode: q.learningObjectiveCode,
      cognitiveLevel: q.cognitiveLevel,
      difficulty: q.difficulty,
      correctOptionLabel: q.correctOptionLabel,
      explanation: q.explanation,
      status: q.status,
      version: q.version,
      deletedAt: q.deletedAt,
      options: q.options.map((o) => ({
        label: o.label,
        content: o.content,
        isCorrect: o.isCorrect,
        justification: o.justification,
      })),
    }));

    const distribution =
      (config.chapterDistribution as Record<string, number>) ?? {
        '1': 8,
        '2': 6,
        '3': 4,
        '4': 12,
        '5': 8,
        '6': 2,
      };

    const targetCount =
      mode === 'FULL'
        ? config.totalQuestions
        : questionCount ?? Math.min(10, candidates.length);

    const selection = selectQuestionsForExam({
      mode,
      allQuestions: candidates,
      seenQuestionIds,
      chapterDistribution: distribution,
      targetCount,
    });

    const totalSelected = selection.selectedQuestions.length;

    // Cálculo de tempo no servidor (60 min para 40 questões; proporcional para provas menores)
    let baseDurationSeconds =
      mode === 'FULL'
        ? config.durationMinutes * 60
        : Math.max(300, totalSelected * 90);

    const bonusEligible =
      Boolean(applyNonNativeBonus) &&
      user.nonNativeLanguageBonus &&
      config.allowNonNativeBonus;

    if (bonusEligible) {
      baseDurationSeconds = Math.round(
        baseDurationSeconds * (1 + config.nonNativeBonusPercent / 100)
      );
    }

    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + baseDurationSeconds * 1000
    );

    const attempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.examAttempt.create({
        data: {
          userId: user.id,
          configurationId: config.id,
          mode,
          status: 'IN_PROGRESS',
          title,
          filterMetadata: {
            chapterId: chapterId ?? null,
            topicIds: topicIds ?? [],
            difficulties: difficulties ?? [],
            bonusEligible,
          },
          totalQuestions: totalSelected,
          durationSeconds: baseDurationSeconds,
          startedAt,
          expiresAt,
          usedRepeatedQuestions: selection.usedRepeatedQuestions,
          configSnapshot: {
            configCode: config.code,
            configVersion: config.version,
            passingScore: config.passingScore,
            pointsPerQuestion: config.pointsPerQuestion,
            durationMinutes: config.durationMinutes,
            bonusEligible,
          },
        },
      });

      for (let idx = 0; idx < selection.selectedQuestions.length; idx++) {
        const q = selection.selectedQuestions[idx];
        const shuffled = prepareShuffledOptions(q.options, true);

        await tx.examQuestion.create({
          data: {
            attemptId: createdAttempt.id,
            questionId: q.id,
            orderIndex: idx + 1,
            questionVersion: q.version,
            statementSnapshot: q.statement,
            optionsSnapshot:
              shuffled.optionsSnapshot as unknown as Prisma.InputJsonValue,
            correctDisplayLabel: shuffled.correctDisplayLabel,
            explanationSnapshot: q.explanation,
            chapterNumberSnapshot: q.chapterNumber,
            topicCodeSnapshot: q.topicCode,
            learningObjectiveSnapshot: q.learningObjectiveCode,
            cognitiveLevelSnapshot: q.cognitiveLevel,
            difficultySnapshot: q.difficulty,
            markedForReview: false,
          },
        });
      }

      return createdAttempt;
    });

    return NextResponse.json(
      {
        attemptId: attempt.id,
        usedRepeatedQuestions: attempt.usedRepeatedQuestions,
        totalQuestions: attempt.totalQuestions,
        durationSeconds: attempt.durationSeconds,
        expiresAt: attempt.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof InsufficientQuestionBankError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error('[Create Exam Attempt] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar simulado.' },
      { status: 500 }
    );
  }
}
