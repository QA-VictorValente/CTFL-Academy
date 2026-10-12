import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { createOrUpdateQuestionSchema } from '@/lib/validations';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const question = await prisma.question.findFirst({
      where: { id: params.id, deletedAt: null },
      include: {
        chapter: true,
        topic: true,
        source: true,
        options: { orderBy: { orderIndex: 'asc' } },
        reviews: {
          include: {
            reviewer: { select: { id: true, fullName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        revisions: {
          include: {
            editor: { select: { id: true, fullName: true, email: true } },
          },
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Questão não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro ao consultar questão.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const existing = await prisma.question.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Questão não encontrada.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = createOrUpdateQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'Dados da questão inválidos.',
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const correctOpt = data.options.find((o) => o.isCorrect)!;
    const nextVersion = existing.version + 1;

    const updated = await prisma.$transaction(async (tx) => {
      const q = await tx.question.update({
        where: { id: existing.id },
        data: {
          code: data.code,
          equivalenceGroupId: data.equivalenceGroupId || null,
          statement: data.statement,
          chapterId: data.chapterId,
          topicId: data.topicId,
          learningObjectiveCode: data.learningObjectiveCode,
          cognitiveLevel: data.cognitiveLevel,
          difficulty: data.difficulty,
          correctOptionLabel: correctOpt.label,
          explanation: data.explanation,
          referenceSection: data.referenceSection,
          sourceId: data.sourceId,
          isOfficialSample: data.isOfficialSample,
          isExercise: data.isExercise,
          version: nextVersion,
        },
      });

      for (let i = 0; i < data.options.length; i++) {
        const opt = data.options[i];
        await tx.answerOption.upsert({
          where: {
            questionId_label: {
              questionId: q.id,
              label: opt.label,
            },
          },
          update: {
            content: opt.content,
            isCorrect: opt.isCorrect,
            justification: opt.justification ?? null,
            orderIndex: i,
          },
          create: {
            questionId: q.id,
            label: opt.label,
            content: opt.content,
            isCorrect: opt.isCorrect,
            justification: opt.justification ?? null,
            orderIndex: i,
          },
        });
      }

      await tx.questionRevision.create({
        data: {
          questionId: q.id,
          version: nextVersion,
          editorId: admin.id,
          changeReason: data.changeReason || `Revisão editorial v${nextVersion}`,
          snapshot: {
            code: data.code,
            statement: data.statement,
            correctOptionLabel: correctOpt.label,
            explanation: data.explanation,
            learningObjectiveCode: data.learningObjectiveCode,
            options: data.options,
          },
        },
      });

      return q;
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'QUESTION_UPDATED',
      entityType: 'Question',
      entityId: updated.id,
      details: { code: updated.code, version: updated.version },
    });

    return NextResponse.json({ question: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Admin Question PUT] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar questão.' },
      { status: 500 }
    );
  }
}
