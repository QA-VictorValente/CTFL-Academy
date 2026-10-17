import * as React from 'react';
import { cookies } from 'next/headers';
import { prisma } from '@/backend/db/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserProfile } from '@prisma/client';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from '@/backend/services/auth.service';

const reactCache =
  typeof React.cache === 'function'
    ? React.cache
    : <T extends (...args: never[]) => unknown>(fn: T): T => fn;

const USER_CACHE_TTL_MS = 4000;
const userProfileCache = new Map<
  string,
  { profile: UserProfile; expiresAt: number }
>();

export function invalidateUserCache(userId?: string) {
  if (userId) {
    userProfileCache.delete(userId);
  } else {
    userProfileCache.clear();
  }
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  userProfileCache.clear();
}

export const getCurrentUser = reactCache(async (): Promise<UserProfile | null> => {
  try {
    const isLocalMode = process.env.SUPABASE_LOCAL_AUTH !== 'false';
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const cached = userProfileCache.get(payload.userId);
        if (cached && cached.expiresAt > Date.now()) {
          return cached.profile;
        }

        const profile = await prisma.userProfile.findFirst({
          where: {
            id: payload.userId,
            deletedAt: null,
          },
        });
        if (profile) {
          userProfileCache.set(payload.userId, {
            profile,
            expiresAt: Date.now() + USER_CACHE_TTL_MS,
          });
          return profile;
        }
      }
    }

    if (!isLocalMode) {
      const supabase = createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) {
        let profile = await prisma.userProfile.findFirst({
          where: {
            OR: [{ supabaseUserId: user.id }, { email: user.email }],
            deletedAt: null,
          },
        });
        if (!profile) {
          profile = await prisma.userProfile.create({
            data: {
              supabaseUserId: user.id,
              email: user.email,
              fullName:
                (user.user_metadata?.full_name as string) ||
                user.email.split('@')[0],
              role: 'STUDENT',
            },
          });
        }
        return profile;
      }
    }

    return null;
  } catch {
    return null;
  }
});

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError('Autenticação necessária para acessar este recurso.', 401);
  }
  return user;
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new AuthError(
      'Acesso negado: permissão exclusiva de Administrador exigida no servidor.',
      403
    );
  }
  return user;
}
