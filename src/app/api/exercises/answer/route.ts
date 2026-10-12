import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { awardXpAndRecordActivity, XP_RULES } from '@/lib/gamification';

const exerciseAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedLabel: z.enum(['A', 'B', 'C', 'D']),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = exerciseAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de resposta inválidos.' },
        { status: 400 }
      );
    }

    const { questionId, selectedLabel } = parsed.data;

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
      return NextResponse.json(
        { error: 'Questão não encontrada ou não publicada.' },
        { status: 404 }
      );
    }

    const isCorrect = selectedLabel === question.correctOptionLabel;

    await prisma.userAnswer.create({
      data: {
        userId: user.id,
        questionId: question.id,
        selectedLabel,
        isCorrect,
        context: 'EXERCISE',
      },
    });

    const existingTp = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: user.id,
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
          userId: user.id,
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
        userId: user.id,
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
        userId: user.id,
        eventType: 'EXERCISE_CORRECT',
        points: XP_RULES.EXERCISE_CORRECT,
        idempotencyKey: `exercise:${user.id}:${question.id}`,
        activityType: 'EXERCISE_SOLVED',
        description: `Exercício resolvido corretamente (${question.code})`,
        referenceId: question.id,
      });
      xpAwarded = xpRes.pointsAdded;
      unlockedAchievements = xpRes.unlockedAchievements;
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Exercise Answer] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar resposta.' },
      { status: 500 }
    );
  }
}
