import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const XP_RULES = {
  LESSON_COMPLETED: 30,
  EXERCISE_CORRECT: 15,
  FLASHCARD_REVIEWED: 5,
  EXAM_COMPLETED: 80,
  EXAM_PASSED: 150,
} as const;

export type XPEventType = keyof typeof XP_RULES | 'ACHIEVEMENT_UNLOCKED';

export function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStudyStreak(
  lastStudyDate: Date | null | undefined,
  now: Date,
  currentStreak: number,
  longestStreak: number
): {
  newStreak: number;
  newLongestStreak: number;
  studyDateKey: string;
} {
  const todayKey = toDateKey(now);
  if (!lastStudyDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(1, longestStreak),
      studyDateKey: todayKey,
    };
  }

  const lastKey = toDateKey(lastStudyDate);
  if (lastKey === todayKey) {
    const safeStreak = Math.max(1, currentStreak);
    return {
      newStreak: safeStreak,
      newLongestStreak: Math.max(safeStreak, longestStreak),
      studyDateKey: todayKey,
    };
  }

  const todayMidnight = new Date(`${todayKey}T00:00:00.000Z`).getTime();
  const lastMidnight = new Date(`${lastKey}T00:00:00.000Z`).getTime();
  const diffDays = Math.round((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const nextStreak = currentStreak + 1;
    return {
      newStreak: nextStreak,
      newLongestStreak: Math.max(nextStreak, longestStreak),
      studyDateKey: todayKey,
    };
  }

  return {
    newStreak: 1,
    newLongestStreak: Math.max(1, longestStreak),
    studyDateKey: todayKey,
  };
}

export async function awardXpAndRecordActivity(params: {
  userId: string;
  eventType: XPEventType;
  points: number;
  idempotencyKey: string;
  activityType: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ awarded: boolean; pointsAdded: number; unlockedAchievements: string[] }> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const existingEvent = await tx.xPEvent.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });

    if (existingEvent) {
      return {
        awarded: false,
        pointsAdded: 0,
        unlockedAchievements: [],
      };
    }

    const user = await tx.userProfile.findUnique({
      where: { id: params.userId },
    });
    if (!user) {
      return { awarded: false, pointsAdded: 0, unlockedAchievements: [] };
    }

    const streakResult = calculateStudyStreak(
      user.lastStudyDate,
      now,
      user.currentStreak,
      user.longestStreak
    );

    await tx.xPEvent.create({
      data: {
        userId: params.userId,
        eventType: params.eventType,
        points: params.points,
        idempotencyKey: params.idempotencyKey,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });

    await tx.studyActivity.create({
      data: {
        userId: params.userId,
        activityType: params.activityType,
        studyDate: streakResult.studyDateKey,
        referenceId: params.referenceId,
        description: params.description,
        xpEarned: params.points,
      },
    });

    let totalPointsAdded = params.points;

    await tx.userProfile.update({
      where: { id: params.userId },
      data: {
        totalXp: { increment: params.points },
        currentStreak: streakResult.newStreak,
        longestStreak: streakResult.newLongestStreak,
        lastStudyDate: now,
      },
    });

    // Avaliar conquistas elegíveis
    const activeAchievements = await tx.achievement.findMany({
      where: { isActive: true },
    });
    const unlockedRecords = await tx.userAchievement.findMany({
      where: { userId: params.userId },
      select: { achievementId: true },
    });
    const unlockedSet = new Set(unlockedRecords.map((u) => u.achievementId));

    const [
      topicProgresses,
      flashcardCount,
      correctAnswersCount,
      completedExamsCount,
      passedExamsCount,
    ] = await Promise.all([
      tx.topicProgress.findMany({ where: { userId: params.userId } }),
      tx.flashcardReview.count({ where: { userId: params.userId } }),
      tx.userAnswer.count({ where: { userId: params.userId, isCorrect: true } }),
      tx.examAttempt.count({
        where: { userId: params.userId, status: 'COMPLETED' },
      }),
      tx.examAttempt.count({
        where: { userId: params.userId, status: 'COMPLETED', passed: true },
      }),
    ]);

    const completedLessonsCount = topicProgresses.reduce((acc, tp) => {
      const arr = Array.isArray(tp.completedLessonIds) ? tp.completedLessonIds : [];
      return acc + arr.length;
    }, 0);

    const newlyUnlockedTitles: string[] = [];

    for (const ach of activeAchievements) {
      if (unlockedSet.has(ach.id)) continue;

      let currentMetric = 0;
      switch (ach.ruleType) {
        case 'LESSONS_COMPLETED':
          currentMetric = completedLessonsCount;
          break;
        case 'FLASHCARDS_REVIEWED':
          currentMetric = flashcardCount;
          break;
        case 'CORRECT_ANSWERS':
          currentMetric = correctAnswersCount;
          break;
        case 'EXAMS_COMPLETED':
          currentMetric = completedExamsCount;
          break;
        case 'EXAMS_PASSED':
          currentMetric = passedExamsCount;
          break;
        case 'STREAK_DAYS':
          currentMetric = streakResult.newStreak;
          break;
        default:
          currentMetric = 0;
      }

      if (currentMetric >= ach.ruleThreshold) {
        await tx.userAchievement.create({
          data: {
            userId: params.userId,
            achievementId: ach.id,
          },
        });

        const achKey = `ach:${params.userId}:${ach.code}`;
        const existingAchXp = await tx.xPEvent.findUnique({
          where: { idempotencyKey: achKey },
        });
        if (!existingAchXp && ach.xpReward > 0) {
          await tx.xPEvent.create({
            data: {
              userId: params.userId,
              eventType: 'ACHIEVEMENT_UNLOCKED',
              points: ach.xpReward,
              idempotencyKey: achKey,
              metadata: { achievementCode: ach.code, title: ach.title },
            },
          });
          await tx.userProfile.update({
            where: { id: params.userId },
            data: { totalXp: { increment: ach.xpReward } },
          });
          totalPointsAdded += ach.xpReward;
        }
        newlyUnlockedTitles.push(ach.title);
      }
    }

    return {
      awarded: true,
      pointsAdded: totalPointsAdded,
      unlockedAchievements: newlyUnlockedTitles,
    };
  });
}
