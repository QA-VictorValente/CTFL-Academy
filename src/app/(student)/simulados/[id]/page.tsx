import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  calculateServerTimer,
  type ShuffledOptionSnapshot,
} from '@/lib/exam-engine';
import { finalizeExamAttemptIdempotent } from '@/lib/exam-service';
import { ExamRunner } from '@/components/student/exam-runner';

export default async function ExamExecutionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      examQuestions: {
        orderBy: { orderIndex: 'asc' },
        include: { userAnswer: true },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  const timer = calculateServerTimer(
    attempt.startedAt,
    attempt.expiresAt,
    new Date()
  );

  if (attempt.status !== 'IN_PROGRESS' || timer.isExpired) {
    if (attempt.status === 'IN_PROGRESS' && timer.isExpired) {
      await finalizeExamAttemptIdempotent(attempt.id, user.id);
    }
    redirect(`/simulados/${attempt.id}/resultado`);
  }

  const questions = attempt.examQuestions.map((eq) => {
    const rawOpts = Array.isArray(eq.optionsSnapshot)
      ? (eq.optionsSnapshot as unknown as ShuffledOptionSnapshot[])
      : [];

    return {
      id: eq.id,
      questionId: eq.questionId,
      orderIndex: eq.orderIndex,
      statement: eq.statementSnapshot,
      chapterNumber: eq.chapterNumberSnapshot,
      topicCode: eq.topicCodeSnapshot,
      learningObjective: eq.learningObjectiveSnapshot,
      cognitiveLevel: eq.cognitiveLevelSnapshot,
      difficulty: eq.difficultySnapshot,
      markedForReview: eq.markedForReview,
      selectedLabel:
        (eq.userAnswer?.selectedLabel as 'A' | 'B' | 'C' | 'D' | null) ?? null,
      options: rawOpts.map((o) => ({
        displayLabel: o.displayLabel,
        content: o.content,
      })),
    };
  });

  return (
    <ExamRunner
      attemptId={attempt.id}
      title={attempt.title}
      initialRemainingSeconds={timer.remainingSeconds}
      usedRepeatedQuestions={attempt.usedRepeatedQuestions}
      initialQuestions={questions}
    />
  );
}
