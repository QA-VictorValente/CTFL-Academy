import { prisma } from '@/backend/db/prisma';
import { awardXpAndRecordActivity, XP_RULES } from '@/backend/services/gamification.service';

export async function completeLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, deletedAt: null },
    include: {
      topic: {
        include: {
          lessons: { where: { deletedAt: null, isPublished: true } },
        },
      },
    },
  });

  if (!lesson) {
    return { notFound: true };
  }

  const existingProgress = await prisma.topicProgress.findUnique({
    where: {
      userId_topicId: {
        userId,
        topicId: lesson.topicId,
      },
    },
  });

  const currentCompletedIds: string[] = Array.isArray(
    existingProgress?.completedLessonIds
  )
    ? (existingProgress?.completedLessonIds as string[])
    : [];

  const updatedLessonIds = Array.from(
    new Set([...currentCompletedIds, lesson.id])
  );
  const totalTopicLessons = lesson.topic.lessons.length;
  const allCompleted = updatedLessonIds.length >= totalTopicLessons;

  const accuracy = existingProgress?.accuracyPercent ?? 0;
  const lessonWeight =
    totalTopicLessons > 0
      ? (updatedLessonIds.length / totalTopicLessons) * 50
      : 50;
  const masteryScore = Number(
    Math.min(100, lessonWeight + accuracy * 0.5).toFixed(1)
  );

  await prisma.topicProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId: lesson.topicId,
      },
    },
    update: {
      completedLessonIds: updatedLessonIds,
      lessonsCompleted: allCompleted,
      masteryScore,
      lastStudiedAt: new Date(),
    },
    create: {
      userId,
      chapterId: lesson.topic.chapterId,
      topicId: lesson.topicId,
      completedLessonIds: updatedLessonIds,
      lessonsCompleted: allCompleted,
      masteryScore,
      lastStudiedAt: new Date(),
    },
  });

  await prisma.userProfile.update({
    where: { id: userId },
    data: { lastLessonId: lesson.id },
  });

  const xpResult = await awardXpAndRecordActivity({
    userId,
    eventType: 'LESSON_COMPLETED',
    points: XP_RULES.LESSON_COMPLETED,
    idempotencyKey: `LESSON:${userId}:${lesson.id}`,
    activityType: 'LESSON_STUDY',
    description: `Aula concluída: ${lesson.title}`,
    referenceId: lesson.id,
    metadata: {
      topicCode: lesson.topic.code,
      lessonSlug: lesson.slug,
    },
  });

  return {
    success: true,
    lessonsCompleted: allCompleted,
    xpAwarded: xpResult.pointsAdded,
    unlockedAchievements: xpResult.unlockedAchievements,
  };
}
