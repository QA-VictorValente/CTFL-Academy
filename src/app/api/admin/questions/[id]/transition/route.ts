import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { questionTransitionSchema } from '@/lib/validations';
import { resolveNextQuestionStatus } from '@/lib/question-workflow';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const question = await prisma.question.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Questão não encontrada.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = questionTransitionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de transição editorial inválidos.' },
        { status: 400 }
      );
    }

    const { action, comments } = parsed.data;
    const transition = resolveNextQuestionStatus(question.status, action);

    if (!transition.valid || !transition.nextStatus) {
      return NextResponse.json(
        { error: transition.error || 'Transição não permitida.' },
        { status: 422 }
      );
    }

    const nextStatus = transition.nextStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const q = await tx.question.update({
        where: { id: question.id },
        data: {
          status: nextStatus,
          reviewerId:
            action === 'APPROVE' || action === 'REJECT' || action === 'PUBLISH'
              ? admin.id
              : question.reviewerId,
        },
      });

      await tx.questionReview.create({
        data: {
          questionId: question.id,
          reviewerId: admin.id,
          previousStatus: question.status,
          newStatus: nextStatus,
          decision: action,
          comments: comments || null,
          versionReviewed: question.version,
        },
      });

      return q;
    });

    await logAuditEvent({
      actorId: admin.id,
      action: `QUESTION_STATUS_${action}`,
      entityType: 'Question',
      entityId: question.id,
      details: {
        code: question.code,
        previousStatus: question.status,
        newStatus: nextStatus,
        comments: comments || null,
      },
    });

    return NextResponse.json({ question: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Question Transition] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao alterar status da questão.' },
      { status: 500 }
    );
  }
}
