import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const original = await prisma.question.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!original) {
      return NextResponse.json(
        { error: 'Questão original não encontrada.' },
        { status: 404 }
      );
    }

    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const newCode = `${original.code}-COPY-${suffix}`;
    const equivalenceGroup = original.equivalenceGroupId || `EQ-${original.code}`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const copy = await tx.question.create({
        data: {
          code: newCode,
          equivalenceGroupId: equivalenceGroup,
          statement: `${original.statement} (Cópia para Edição)`,
          chapterId: original.chapterId,
          topicId: original.topicId,
          learningObjectiveCode: original.learningObjectiveCode,
          cognitiveLevel: original.cognitiveLevel,
          difficulty: original.difficulty,
          correctOptionLabel: original.correctOptionLabel,
          explanation: original.explanation,
          referenceSection: original.referenceSection,
          sourceId: original.sourceId,
          isOfficialSample: original.isOfficialSample,
          isExercise: original.isExercise,
          status: 'DRAFT',
          version: 1,
          authorId: admin.id,
        },
      });

      for (const opt of original.options) {
        await tx.answerOption.create({
          data: {
            questionId: copy.id,
            label: opt.label,
            content: opt.content,
            isCorrect: opt.isCorrect,
            justification: opt.justification,
            orderIndex: opt.orderIndex,
          },
        });
      }

      await tx.questionRevision.create({
        data: {
          questionId: copy.id,
          version: 1,
          editorId: admin.id,
          changeReason: `Duplicada a partir de ${original.code}`,
          snapshot: {
            code: newCode,
            duplicatedFrom: original.code,
            statement: copy.statement,
          },
        },
      });

      return copy;
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'QUESTION_DUPLICATED',
      entityType: 'Question',
      entityId: duplicated.id,
      details: {
        originalQuestionId: original.id,
        originalCode: original.code,
        newCode: duplicated.code,
      },
    });

    return NextResponse.json({ question: duplicated }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Duplicate Question] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao duplicar questão.' },
      { status: 500 }
    );
  }
}
