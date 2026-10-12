import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { awardXpAndRecordActivity, XP_RULES } from '@/lib/gamification';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const lessonId = params.id;

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
      return NextResponse.json(
        { error: 'Aula não encontrada.' },
        { status: 404 }
      );
    }

    const existingProgress = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: user.id,
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
          userId: user.id,
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
        userId: user.id,
        chapterId: lesson.topic.chapterId,
        topicId: lesson.topicId,
        completedLessonIds: updatedLessonIds,
        lessonsCompleted: allCompleted,
        masteryScore,
        lastStudiedAt: new Date(),
      },
    });

    await prisma.userProfile.update({
      where: { id: user.id },
      data: { lastLessonId: lesson.id },
    });

    const xpResult = await awardXpAndRecordActivity({
      userId: user.id,
      eventType: 'LESSON_COMPLETED',
      points: XP_RULES.LESSON_COMPLETED,
      idempotencyKey: `lesson:${user.id}:${lesson.id}`,
      activityType: 'LESSON_STUDY',
      description: `Aula concluída: ${lesson.title}`,
      referenceId: lesson.id,
      metadata: {
        topicCode: lesson.topic.code,
        lessonSlug: lesson.slug,
      },
    });

    return NextResponse.json({
      success: true,
      lessonsCompleted: allCompleted,
      xpAwarded: xpResult.pointsAdded,
      unlockedAchievements: xpResult.unlockedAchievements,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Lesson Complete] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar conclusão da aula.' },
      { status: 500 }
    );
  }
}
