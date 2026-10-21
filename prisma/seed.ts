import { PrismaClient } from '@prisma/client';
import { SYLLABUS_CHAPTERS_DATA } from './fixtures/syllabus-content';
import { QUESTIONS_CH1_TO_3 } from './fixtures/questions-ch1-3';
import { QUESTIONS_CH4_TO_6 } from './fixtures/questions-ch4-6';
import { QUESTIONS_CH_EXPANSION } from './fixtures/questions-ch-expansion';
import {
  SEED_FLASHCARDS,
  SEED_ACHIEVEMENTS,
} from './fixtures/flashcards-achievements';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Iniciando carga idempotente do CTFL Academy (Syllabus v4.0.1)...');

  // 1. Roles
  await prisma.role.upsert({
    where: { code: 'STUDENT' },
    update: {
      name: 'Estudante CTFL',
      description: 'Perfil padrão de estudante com acesso a capítulos, aulas, exercícios, flashcards e simulados.',
    },
    create: {
      code: 'STUDENT',
      name: 'Estudante CTFL',
      description: 'Perfil padrão de estudante com acesso a capítulos, aulas, exercícios, flashcards e simulados.',
      permissions: ['chapters:read', 'exams:take', 'flashcards:study', 'profile:manage'],
    },
  });

  await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {
      name: 'Administrador Editorial e de Sistema',
      description: 'Perfil administrativo com permissão de gestão de conteúdo, curadoria de questões e auditoria.',
    },
    create: {
      code: 'ADMIN',
      name: 'Administrador Editorial e de Sistema',
      description: 'Perfil administrativo com permissão de gestão de conteúdo, curadoria de questões e auditoria.',
      permissions: [
        'chapters:manage',
        'questions:manage',
        'questions:review',
        'questions:publish',
        'flashcards:manage',
        'exams:manage',
        'achievements:manage',
        'audit:view',
      ],
    },
  });

  // 2. QuestionSource Autoral
  const authorialSource = await prisma.questionSource.upsert({
    where: { name: 'Acervo Autoral CTFL Academy (Baseado no Syllabus 4.0.1)' },
    update: {
      referenceDocument: 'ISTQB® Certified Tester Foundation Level (CTFL) Syllabus v4.0.1',
      licenseNotes:
        'Questões originais e autorais elaboradas em português brasileiro para fins didáticos, alinhadas aos Objetivos de Aprendizagem (FL-x.x.x) do Syllabus CTFL v4.0.1.',
    },
    create: {
      name: 'Acervo Autoral CTFL Academy (Baseado no Syllabus 4.0.1)',
      sourceType: 'AUTHORIAL',
      referenceDocument: 'ISTQB® Certified Tester Foundation Level (CTFL) Syllabus v4.0.1',
      licenseNotes:
        'Questões originais e autorais elaboradas em português brasileiro para fins didáticos, alinhadas aos Objetivos de Aprendizagem (FL-x.x.x) do Syllabus CTFL v4.0.1.',
      url: 'https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0',
    },
  });

  // 3. Configuração Oficial Versionada do Simulado CTFL v4.0
  await prisma.examConfiguration.upsert({
    where: { code: 'CTFL-V4-OFFICIAL-40' },
    update: {
      name: 'Exame Oficial Padrão ISTQB CTFL v4.0.1',
      description:
        'Configuração de referência do exame CTFL v4.0: 40 questões de múltipla escolha, 60 minutos de duração, aprovação com pelo menos 26 pontos (65%), seguindo a distribuição oficial por capítulo (8, 6, 4, 12, 8, 2).',
      totalQuestions: 40,
      durationMinutes: 60,
      passingScore: 26,
      pointsPerQuestion: 1,
      allowNonNativeBonus: true,
      nonNativeBonusPercent: 25,
      chapterDistribution: {
        '1': 8,
        '2': 6,
        '3': 4,
        '4': 12,
        '5': 8,
        '6': 2,
      },
      isActive: true,
    },
    create: {
      code: 'CTFL-V4-OFFICIAL-40',
      name: 'Exame Oficial Padrão ISTQB CTFL v4.0.1',
      description:
        'Configuração de referência do exame CTFL v4.0: 40 questões de múltipla escolha, 60 minutos de duração, aprovação com pelo menos 26 pontos (65%), seguindo a distribuição oficial por capítulo (8, 6, 4, 12, 8, 2).',
      version: 1,
      totalQuestions: 40,
      durationMinutes: 60,
      passingScore: 26,
      pointsPerQuestion: 1,
      allowNonNativeBonus: true,
      nonNativeBonusPercent: 25,
      chapterDistribution: {
        '1': 8,
        '2': 6,
        '3': 4,
        '4': 12,
        '5': 8,
        '6': 2,
      },
      isActive: true,
    },
  });

  // 4. Capítulos, Tópicos e Aulas
  const topicMap = new Map<string, { id: string; chapterId: string }>();

  for (const chData of SYLLABUS_CHAPTERS_DATA) {
    const chapter = await prisma.chapter.upsert({
      where: { number: chData.number },
      update: {
        slug: chData.slug,
        title: chData.title,
        description: chData.description,
        introduction: chData.introduction,
        learningObjectivesSummary: chData.learningObjectivesSummary,
        examWeightQuestions: chData.examWeightQuestions,
        recommendedOrder: chData.recommendedOrder,
        isPublished: true,
      },
      create: {
        number: chData.number,
        slug: chData.slug,
        title: chData.title,
        description: chData.description,
        introduction: chData.introduction,
        learningObjectivesSummary: chData.learningObjectivesSummary,
        examWeightQuestions: chData.examWeightQuestions,
        recommendedOrder: chData.recommendedOrder,
        isPublished: true,
      },
    });

    for (const topData of chData.topics) {
      const topic = await prisma.topic.upsert({
        where: { code: topData.code },
        update: {
          chapterId: chapter.id,
          slug: topData.slug,
          title: topData.title,
          learningObjectives: topData.learningObjectives as unknown as object,
          kLevelMax: topData.kLevelMax,
          orderIndex: topData.orderIndex,
        },
        create: {
          chapterId: chapter.id,
          code: topData.code,
          slug: topData.slug,
          title: topData.title,
          learningObjectives: topData.learningObjectives as unknown as object,
          kLevelMax: topData.kLevelMax,
          orderIndex: topData.orderIndex,
        },
      });

      topicMap.set(topData.code, { id: topic.id, chapterId: chapter.id });

      for (const lesData of topData.lessons) {
        await prisma.lesson.upsert({
          where: { slug: lesData.slug },
          update: {
            topicId: topic.id,
            title: lesData.title,
            explanation: lesData.explanation,
            definitions: lesData.definitions as unknown as object,
            practicalExamples: lesData.practicalExamples,
            qaRoutineExamples: lesData.qaRoutineExamples,
            summary: lesData.summary,
            estimatedMinutes: lesData.estimatedMinutes,
            orderIndex: lesData.orderIndex,
            isPublished: true,
          },
          create: {
            topicId: topic.id,
            slug: lesData.slug,
            title: lesData.title,
            explanation: lesData.explanation,
            definitions: lesData.definitions as unknown as object,
            practicalExamples: lesData.practicalExamples,
            qaRoutineExamples: lesData.qaRoutineExamples,
            summary: lesData.summary,
            estimatedMinutes: lesData.estimatedMinutes,
            orderIndex: lesData.orderIndex,
            isPublished: true,
          },
        });
      }
    }
  }

  // 5. Questões Autorais + Alternativas + Revisão Inicial
  const allQuestions = [
    ...QUESTIONS_CH1_TO_3,
    ...QUESTIONS_CH4_TO_6,
    ...QUESTIONS_CH_EXPANSION,
  ];
  for (const qData of allQuestions) {
    const topicRef = topicMap.get(qData.topicCode);
    if (!topicRef) {
      throw new Error(`Tópico não encontrado para a questão ${qData.code}: ${qData.topicCode}`);
    }

    const editorialStatus = qData.status || 'PUBLISHED';

    const question = await prisma.question.upsert({
      where: { code: qData.code },
      update: {
        equivalenceGroupId: qData.equivalenceGroupId ?? null,
        statement: qData.statement,
        chapterId: topicRef.chapterId,
        topicId: topicRef.id,
        learningObjectiveCode: qData.learningObjectiveCode,
        cognitiveLevel: qData.cognitiveLevel,
        difficulty: qData.difficulty,
        correctOptionLabel: qData.correctOptionLabel,
        explanation: qData.explanation,
        referenceSection: qData.referenceSection,
        sourceId: authorialSource.id,
        isOfficialSample: false,
        isExercise: true,
        status: editorialStatus,
      },
      create: {
        code: qData.code,
        equivalenceGroupId: qData.equivalenceGroupId ?? null,
        statement: qData.statement,
        chapterId: topicRef.chapterId,
        topicId: topicRef.id,
        learningObjectiveCode: qData.learningObjectiveCode,
        cognitiveLevel: qData.cognitiveLevel,
        difficulty: qData.difficulty,
        correctOptionLabel: qData.correctOptionLabel,
        explanation: qData.explanation,
        referenceSection: qData.referenceSection,
        sourceId: authorialSource.id,
        isOfficialSample: false,
        isExercise: true,
        status: editorialStatus,
        version: 1,
      },
    });

    for (let i = 0; i < qData.options.length; i++) {
      const opt = qData.options[i];
      await prisma.answerOption.upsert({
        where: {
          questionId_label: {
            questionId: question.id,
            label: opt.label,
          },
        },
        update: {
          content: opt.content,
          isCorrect: opt.isCorrect,
          justification: opt.justification,
          orderIndex: i,
        },
        create: {
          questionId: question.id,
          label: opt.label,
          content: opt.content,
          isCorrect: opt.isCorrect,
          justification: opt.justification,
          orderIndex: i,
        },
      });
    }

    await prisma.questionRevision.upsert({
      where: {
        questionId_version: {
          questionId: question.id,
          version: 1,
        },
      },
      update: {},
      create: {
        questionId: question.id,
        version: 1,
        changeReason: 'Cadastro inicial via seed versionado',
        snapshot: {
          code: qData.code,
          statement: qData.statement,
          correctOptionLabel: qData.correctOptionLabel,
          explanation: qData.explanation,
          learningObjectiveCode: qData.learningObjectiveCode,
          options: qData.options,
        },
      },
    });
  }

  // 6. Flashcards Autorais (idempotência por topicId + front)
  for (const fcData of SEED_FLASHCARDS) {
    const topicRef = topicMap.get(fcData.topicCode);
    if (!topicRef) continue;

    const existing = await prisma.flashcard.findFirst({
      where: {
        topicId: topicRef.id,
        front: fcData.front,
      },
    });

    if (existing) {
      await prisma.flashcard.update({
        where: { id: existing.id },
        data: {
          back: fcData.back,
          tags: fcData.tags,
          difficulty: fcData.difficulty,
          isPublished: true,
        },
      });
    } else {
      await prisma.flashcard.create({
        data: {
          chapterId: topicRef.chapterId,
          topicId: topicRef.id,
          front: fcData.front,
          back: fcData.back,
          tags: fcData.tags,
          difficulty: fcData.difficulty,
          isAuthorial: true,
          isPublished: true,
        },
      });
    }
  }

  // 7. Conquistas (Achievements)
  for (const ach of SEED_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
        ruleType: ach.ruleType,
        ruleThreshold: ach.ruleThreshold,
        isActive: true,
      },
      create: {
        code: ach.code,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
        ruleType: ach.ruleType,
        ruleThreshold: ach.ruleThreshold,
        isActive: true,
      },
    });
  }

  const chapterCount = await prisma.chapter.count();
  const topicCount = await prisma.topic.count();
  const lessonCount = await prisma.lesson.count();
  const questionCount = await prisma.question.count();
  const flashcardCount = await prisma.flashcard.count();
  const achievementCount = await prisma.achievement.count();

  console.log(
    `[Seed] Concluído com sucesso! Capítulos: ${chapterCount} | Tópicos: ${topicCount} | Aulas: ${lessonCount} | Questões: ${questionCount} | Flashcards: ${flashcardCount} | Conquistas: ${achievementCount}`
  );
}

main()
  .catch((err) => {
    console.error('[Seed] Erro ao executar seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
