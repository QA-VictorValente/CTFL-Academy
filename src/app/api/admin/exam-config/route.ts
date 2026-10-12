import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const updateExamConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(3),
  totalQuestions: z.number().int().min(5).max(100),
  durationMinutes: z.number().int().min(10).max(240),
  passingScore: z.number().int().min(1).max(100),
  pointsPerQuestion: z.number().int().min(1).max(10),
  allowNonNativeBonus: z.boolean(),
  nonNativeBonusPercent: z.number().int().min(0).max(100),
  chapterDistribution: z.record(z.string(), z.number().int().min(0)),
});

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = updateExamConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros de configuração de prova inválidos.' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existing = await prisma.examConfiguration.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Configuração não encontrada.' },
        { status: 404 }
      );
    }

    const updated = await prisma.examConfiguration.update({
      where: { id: data.id },
      data: {
        name: data.name,
        totalQuestions: data.totalQuestions,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore,
        pointsPerQuestion: data.pointsPerQuestion,
        allowNonNativeBonus: data.allowNonNativeBonus,
        nonNativeBonusPercent: data.nonNativeBonusPercent,
        chapterDistribution: data.chapterDistribution,
        version: existing.version + 1,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'EXAM_CONFIGURATION_UPDATED',
      entityType: 'ExamConfiguration',
      entityId: updated.id,
      details: { version: updated.version, passingScore: updated.passingScore },
    });

    return NextResponse.json({ configuration: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração de prova.' },
      { status: 500 }
    );
  }
}
