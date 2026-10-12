import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { createOrUpdateQuestionSchema } from '@/lib/validations';
import { logAuditEvent } from '@/lib/audit';
import type {
  Prisma,
  DifficultyLevel,
  QuestionEditorialStatus,
} from '@prisma/client';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(
      50,
      Math.max(5, Number(searchParams.get('pageSize') || 15))
    );
    const chapterId = searchParams.get('chapterId') || undefined;
    const topicId = searchParams.get('topicId') || undefined;
    const difficulty =
      (searchParams.get('difficulty') as DifficultyLevel) || undefined;
    const status =
      (searchParams.get('status') as QuestionEditorialStatus) || undefined;
    const search = searchParams.get('search')?.trim() || undefined;

    const where: Prisma.QuestionWhereInput = {
      deletedAt: null,
    };

    if (chapterId) where.chapterId = chapterId;
    if (topicId) where.topicId = topicId;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { statement: { contains: search, mode: 'insensitive' } },
        { learningObjectiveCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          chapter: { select: { id: true, number: true, title: true } },
          topic: { select: { id: true, code: true, title: true } },
          source: { select: { id: true, name: true, sourceType: true } },
          options: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: [{ updatedAt: 'desc' }, { code: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Admin Questions GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao listar banco de questões.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = createOrUpdateQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'Dados da questão inválidos.',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existingCode = await prisma.question.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: `Já existe uma questão cadastrada com o código ${data.code}.` },
        { status: 409 }
      );
    }

    const correctOpt = data.options.find((o) => o.isCorrect)!;

    const created = await prisma.$transaction(async (tx) => {
      const q = await tx.question.create({
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
          status: 'DRAFT',
          version: 1,
          authorId: admin.id,
        },
      });

      for (let i = 0; i < data.options.length; i++) {
        const opt = data.options[i];
        await tx.answerOption.create({
          data: {
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
          version: 1,
          editorId: admin.id,
          changeReason: data.changeReason || 'Criação inicial da questão',
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
      action: 'QUESTION_CREATED',
      entityType: 'Question',
      entityId: created.id,
      details: { code: created.code, status: created.status },
    });

    return NextResponse.json({ question: created }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Admin Questions POST] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar questão.' },
      { status: 500 }
    );
  }
}
