import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { saveExamAnswerSchema } from '@/lib/validations';
import { calculateServerTimer } from '@/lib/exam-engine';
import { finalizeExamAttemptIdempotent } from '@/lib/exam-service';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Tentativa não encontrada ou acesso negado.' },
        { status: 404 }
      );
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error:
            'Não é permitido registrar ou alterar respostas após o encerramento da prova.',
        },
        { status: 400 }
      );
    }

    const timer = calculateServerTimer(
      attempt.startedAt,
      attempt.expiresAt,
      new Date()
    );

    if (timer.isExpired) {
      await finalizeExamAttemptIdempotent(attempt.id, user.id);
      return NextResponse.json(
        {
          error:
            'O tempo oficial desta tentativa expirou. A prova foi encerrada automaticamente.',
          expired: true,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = saveExamAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Formato de resposta inválido.' },
        { status: 400 }
      );
    }

    const { examQuestionId, selectedLabel, markedForReview } = parsed.data;

    const examQuestion = await prisma.examQuestion.findFirst({
      where: {
        id: examQuestionId,
        attemptId: attempt.id,
      },
    });

    if (!examQuestion) {
      return NextResponse.json(
        { error: 'Questão não pertence a esta tentativa de simulado.' },
        { status: 404 }
      );
    }

    if (markedForReview !== undefined) {
      await prisma.examQuestion.update({
        where: { id: examQuestion.id },
        data: { markedForReview },
      });
    }

    if (selectedLabel !== undefined) {
      // Blindagem anti-side-channel leak: enquanto attempt.status === 'IN_PROGRESS',
      // NUNCA persistir isCorrect real no banco para evitar vazamento via contadores.
      // O cálculo real de acertos é efetuado atomicamente na finalização do simulado.
      await prisma.userAnswer.upsert({
        where: { examQuestionId: examQuestion.id },
        update: {
          selectedLabel,
          isCorrect: false,
        },
        create: {
          attemptId: attempt.id,
          examQuestionId: examQuestion.id,
          userId: user.id,
          questionId: examQuestion.questionId,
          selectedLabel,
          isCorrect: false,
          context: 'EXAM',
        },
      });
    }

    return NextResponse.json({
      success: true,
      remainingSeconds: timer.remainingSeconds,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Save Exam Answer] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar resposta.' },
      { status: 500 }
    );
  }
}
