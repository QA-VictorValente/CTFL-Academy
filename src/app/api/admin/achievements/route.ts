import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const achievementSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(3),
  title: z.string().trim().min(3),
  description: z.string().trim().min(5),
  icon: z.string().trim().default('Award'),
  xpReward: z.number().int().min(10).max(2000),
  ruleType: z.enum([
    'LESSONS_COMPLETED',
    'FLASHCARDS_REVIEWED',
    'CORRECT_ANSWERS',
    'EXAMS_COMPLETED',
    'EXAMS_PASSED',
    'STREAK_DAYS',
  ]),
  ruleThreshold: z.number().int().min(1).max(1000),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = achievementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados da conquista inválidos.' },
        { status: 400 }
      );
    }

    const ach = await prisma.achievement.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        title: parsed.data.title,
        description: parsed.data.description,
        icon: parsed.data.icon,
        xpReward: parsed.data.xpReward,
        ruleType: parsed.data.ruleType,
        ruleThreshold: parsed.data.ruleThreshold,
        isActive: parsed.data.isActive,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'ACHIEVEMENT_CREATED',
      entityType: 'Achievement',
      entityId: ach.id,
      details: { code: ach.code, xpReward: ach.xpReward },
    });

    return NextResponse.json({ achievement: ach }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro ao criar conquista.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = achievementSchema.safeParse(body);

    if (!parsed.success || !parsed.data.id) {
      return NextResponse.json(
        { error: 'Dados da conquista inválidos.' },
        { status: 400 }
      );
    }

    const ach = await prisma.achievement.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        xpReward: parsed.data.xpReward,
        ruleType: parsed.data.ruleType,
        ruleThreshold: parsed.data.ruleThreshold,
        isActive: parsed.data.isActive,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'ACHIEVEMENT_UPDATED',
      entityType: 'Achievement',
      entityId: ach.id,
      details: { code: ach.code, xpReward: ach.xpReward },
    });

    return NextResponse.json({ achievement: ach });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar conquista.' },
      { status: 500 }
    );
  }
}
