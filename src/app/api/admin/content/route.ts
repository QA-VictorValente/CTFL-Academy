import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const updateLessonSchema = z.object({
  entityType: z.literal('lesson'),
  id: z.string().min(1),
  title: z.string().trim().min(3),
  explanation: z.string().trim().min(10),
  practicalExamples: z.string().trim().min(5),
  qaRoutineExamples: z.string().trim().min(5),
  summary: z.string().trim().min(5),
  estimatedMinutes: z.number().int().min(1).max(180),
});

const updateChapterSchema = z.object({
  entityType: z.literal('chapter'),
  id: z.string().min(1),
  title: z.string().trim().min(3),
  description: z.string().trim().min(5),
  introduction: z.string().trim().min(10),
  learningObjectivesSummary: z.string().trim().min(5),
  examWeightQuestions: z.number().int().min(1).max(40),
});

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    if (body?.entityType === 'lesson') {
      const parsed = updateLessonSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Dados da aula inválidos.' },
          { status: 400 }
        );
      }

      const lesson = await prisma.lesson.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          explanation: parsed.data.explanation,
          practicalExamples: parsed.data.practicalExamples,
          qaRoutineExamples: parsed.data.qaRoutineExamples,
          summary: parsed.data.summary,
          estimatedMinutes: parsed.data.estimatedMinutes,
        },
      });

      await logAuditEvent({
        actorId: admin.id,
        action: 'LESSON_UPDATED',
        entityType: 'Lesson',
        entityId: lesson.id,
        details: { title: lesson.title },
      });

      return NextResponse.json({ lesson });
    }

    if (body?.entityType === 'chapter') {
      const parsed = updateChapterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Dados do capítulo inválidos.' },
          { status: 400 }
        );
      }

      const chapter = await prisma.chapter.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          introduction: parsed.data.introduction,
          learningObjectivesSummary: parsed.data.learningObjectivesSummary,
          examWeightQuestions: parsed.data.examWeightQuestions,
        },
      });

      await logAuditEvent({
        actorId: admin.id,
        action: 'CHAPTER_UPDATED',
        entityType: 'Chapter',
        entityId: chapter.id,
        details: { number: chapter.number, title: chapter.title },
      });

      return NextResponse.json({ chapter });
    }

    return NextResponse.json(
      { error: 'Tipo de entidade inválido.' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Admin Content PUT] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar conteúdo.' },
      { status: 500 }
    );
  }
}
