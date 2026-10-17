import { prisma } from '@/backend/db/prisma';
import type { Prisma } from '@prisma/client';

export async function logAuditEvent(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    const sanitizedDetails = params.details ? { ...params.details } : undefined;
    if (sanitizedDetails) {
      delete sanitizedDetails.password;
      delete sanitizedDetails.passwordHash;
      delete sanitizedDetails.token;
      delete sanitizedDetails.secret;
    }

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: sanitizedDetails
          ? (sanitizedDetails as Prisma.InputJsonValue)
          : undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error('[AuditLog] Falha ao registrar evento de auditoria:', error);
  }
}
