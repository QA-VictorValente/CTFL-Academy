import { prisma } from '@/backend/db/prisma';
import { awardXpAndRecordActivity, XP_RULES } from '@/backend/services/gamification.service';

export async function processExerciseAnswer(params: {
  userId: string;
  questionId: string;
  selectedLabel: 'A' | 'B' | 'C' | 'D';
}) {
  const { userId, questionId, selectedLabel } = params;

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      status: 'PUBLISHED',
      deletedAt: null,
    },
    include: {
      options: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!question) {
    return { notFound: true };
  }

  const isCorrect = selectedLabel === question.correctOptionLabel;

  await prisma.userAnswer.create({
    data: {
      userId,
      questionId: question.id,
      selectedLabel,
      isCorrect,
      context: 'EXERCISE',
    },
  });

  const existingTp = await prisma.topicProgress.findUnique({
    where: {
      userId_topicId: {
        userId,
        topicId: question.topicId,
      },
    },
  });

  const nextAnswered = (existingTp?.questionsAnswered ?? 0) + 1;
  const nextCorrect = (existingTp?.questionsCorrect ?? 0) + (isCorrect ? 1 : 0);
  const nextAccuracy = Number(((nextCorrect / nextAnswered) * 100).toFixed(1));
  const lessonBonus = existingTp?.lessonsCompleted ? 50 : 20;
  const nextMastery = Number(
    Math.min(100, lessonBonus + nextAccuracy * 0.5).toFixed(1)
  );

  await prisma.topicProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId: question.topicId,
      },
    },
    update: {
      questionsAnswered: nextAnswered,
      questionsCorrect: nextCorrect,
      accuracyPercent: nextAccuracy,
      masteryScore: nextMastery,
      lastStudiedAt: new Date(),
    },
    create: {
      userId,
      chapterId: question.chapterId,
      topicId: question.topicId,
      completedLessonIds: [],
      lessonsCompleted: false,
      questionsAnswered: 1,
      questionsCorrect: isCorrect ? 1 : 0,
      accuracyPercent: isCorrect ? 100 : 0,
      masteryScore: isCorrect ? 50 : 10,
      lastStudiedAt: new Date(),
    },
  });

  let xpAwarded = 0;
  let unlockedAchievements: string[] = [];

  if (isCorrect) {
    const xpRes = await awardXpAndRecordActivity({
      userId,
      eventType: 'EXERCISE_CORRECT',
      points: XP_RULES.EXERCISE_CORRECT,
      idempotencyKey: `exercise:${userId}:${question.id}`,
      activityType: 'EXERCISE_SOLVED',
      description: `Exercício resolvido corretamente (${question.code})`,
      referenceId: question.id,
    });
    xpAwarded = xpRes.pointsAdded;
    unlockedAchievements = xpRes.unlockedAchievements;
  }

  return {
    isCorrect,
    correctOptionLabel: question.correctOptionLabel,
    explanation: question.explanation,
    referenceSection: question.referenceSection,
    options: question.options.map((o) => ({
      label: o.label,
      isCorrect: o.isCorrect,
      justification: o.justification,
    })),
    xpAwarded,
    unlockedAchievements,
  };
}
