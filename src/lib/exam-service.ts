import { prisma } from '@/lib/prisma';
import {
  calculateServerTimer,
  computeExamScore,
} from '@/lib/exam-engine';
import { awardXpAndRecordActivity, XP_RULES } from '@/lib/gamification';

export async function finalizeExamAttemptIdempotent(
  attemptId: string,
  userId: string
) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      examQuestions: {
        orderBy: { orderIndex: 'asc' },
        include: { userAnswer: true },
      },
      configuration: true,
    },
  });

  if (!attempt) {
    throw new Error('Tentativa de simulado não encontrada.');
  }

  // Idempotência: se já foi finalizada ou expirada, retorna o estado existente sem recalcular nem duplicar XP
  if (attempt.status === 'COMPLETED' || attempt.status === 'EXPIRED') {
    return attempt;
  }

  const now = new Date();
  const timer = calculateServerTimer(attempt.startedAt, attempt.expiresAt, now);

  const passingScorePoints =
    attempt.mode === 'FULL' ? attempt.configuration.passingScore : undefined;

  const scoreSummary = computeExamScore({
    questions: attempt.examQuestions.map((eq) => ({
      id: eq.id,
      correctDisplayLabel: eq.correctDisplayLabel,
      chapterNumberSnapshot: eq.chapterNumberSnapshot,
      topicCodeSnapshot: eq.topicCodeSnapshot,
      selectedLabel: eq.userAnswer?.selectedLabel ?? null,
    })),
    passingScorePoints,
    pointsPerQuestion: attempt.configuration.pointsPerQuestion,
    passingPercentFallback: 65,
  });

  const finalStatus = timer.isExpired ? 'EXPIRED' : 'COMPLETED';

  const updatedAttempt = await prisma.$transaction(async (tx) => {
    const current = await tx.examAttempt.findUnique({
      where: { id: attempt.id },
    });

    if (
      !current ||
      current.status === 'COMPLETED' ||
      current.status === 'EXPIRED'
    ) {
      return tx.examAttempt.findUniqueOrThrow({
        where: { id: attempt.id },
        include: {
          examQuestions: {
            orderBy: { orderIndex: 'asc' },
            include: { userAnswer: true },
          },
          configuration: true,
        },
      });
    }

    // Atualizar o flag isCorrect de cada resposta registrada na tentativa
    for (const eq of attempt.examQuestions) {
      if (eq.userAnswer) {
        const isCorrect =
          eq.userAnswer.selectedLabel === eq.correctDisplayLabel;
        await tx.userAnswer.update({
          where: { id: eq.userAnswer.id },
          data: { isCorrect },
        });
      }
    }

    // Atualizar TopicProgress por questão respondida
    const topicStatsMap = new Map<
      string,
      { chapterId: string; topicId: string; answered: number; correct: number }
    >();

    const questionsWithTopics = await tx.question.findMany({
      where: {
        id: { in: attempt.examQuestions.map((eq) => eq.questionId) },
      },
      select: { id: true, chapterId: true, topicId: true },
    });
    const qMetaMap = new Map(questionsWithTopics.map((q) => [q.id, q]));

    for (const eq of attempt.examQuestions) {
      if (!eq.userAnswer?.selectedLabel) continue;
      const meta = qMetaMap.get(eq.questionId);
      if (!meta) continue;
      const isCorrect = eq.userAnswer.selectedLabel === eq.correctDisplayLabel;
      const curr = topicStatsMap.get(meta.topicId) ?? {
        chapterId: meta.chapterId,
        topicId: meta.topicId,
        answered: 0,
        correct: 0,
      };
      curr.answered += 1;
      if (isCorrect) curr.correct += 1;
      topicStatsMap.set(meta.topicId, curr);
    }

    for (const [, stat] of topicStatsMap.entries()) {
      const existingTp = await tx.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: stat.topicId,
          },
        },
      });

      const nextAnswered = (existingTp?.questionsAnswered ?? 0) + stat.answered;
      const nextCorrect = (existingTp?.questionsCorrect ?? 0) + stat.correct;
      const nextAcc =
        nextAnswered > 0
          ? Number(((nextCorrect / nextAnswered) * 100).toFixed(1))
          : 0;
      const lessonBonus = existingTp?.lessonsCompleted ? 50 : 20;
      const nextMastery = Number(
        Math.min(100, lessonBonus + nextAcc * 0.5).toFixed(1)
      );

      await tx.topicProgress.upsert({
        where: {
          userId_topicId: {
            userId,
            topicId: stat.topicId,
          },
        },
        update: {
          questionsAnswered: nextAnswered,
          questionsCorrect: nextCorrect,
          accuracyPercent: nextAcc,
          masteryScore: nextMastery,
          lastStudiedAt: now,
        },
        create: {
          userId,
          chapterId: stat.chapterId,
          topicId: stat.topicId,
          completedLessonIds: [],
          lessonsCompleted: false,
          questionsAnswered: stat.answered,
          questionsCorrect: stat.correct,
          accuracyPercent: nextAcc,
          masteryScore: nextMastery,
          lastStudiedAt: now,
        },
      });
    }

    return tx.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: finalStatus,
        completedAt: now,
        timeSpentSeconds: timer.elapsedSeconds,
        scorePoints: scoreSummary.scorePoints,
        correctCount: scoreSummary.correctCount,
        wrongCount: scoreSummary.wrongCount,
        unansweredCount: scoreSummary.unansweredCount,
        accuracyPercent: scoreSummary.accuracyPercent,
        passed: scoreSummary.passed,
      },
      include: {
        examQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: { userAnswer: true },
        },
        configuration: true,
      },
    });
  });

  // Conceder XP idempotente pela finalização e eventual aprovação
  await awardXpAndRecordActivity({
    userId,
    eventType: 'EXAM_COMPLETED',
    points: XP_RULES.EXAM_COMPLETED,
    idempotencyKey: `exam-complete:${userId}:${attempt.id}`,
    activityType: 'EXAM_ATTEMPT',
    description: `Simulado finalizado: ${attempt.title} (${scoreSummary.accuracyPercent}%)`,
    referenceId: attempt.id,
  });

  if (scoreSummary.passed) {
    await awardXpAndRecordActivity({
      userId,
      eventType: 'EXAM_PASSED',
      points: XP_RULES.EXAM_PASSED,
      idempotencyKey: `exam-pass:${userId}:${attempt.id}`,
      activityType: 'EXAM_ATTEMPT',
      description: `Aprovação no simulado: ${attempt.title}`,
      referenceId: attempt.id,
    });
  }

  return updatedAttempt;
}
