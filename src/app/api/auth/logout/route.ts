import { NextResponse } from 'next/server';
import { clearSessionCookie, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST() {
  try {
    const user = await getCurrentUser();
    clearSessionCookie();

    if (user) {
      await logAuditEvent({
        actorId: user.id,
        action: 'USER_LOGOUT',
        entityType: 'UserProfile',
        entityId: user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
