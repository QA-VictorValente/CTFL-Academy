import crypto from 'crypto';
import * as React from 'react';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserProfile, UserRole } from '@prisma/client';

const reactCache =
  typeof React.cache === 'function'
    ? React.cache
    : <T extends (...args: never[]) => unknown>(fn: T): T => fn;

export const SESSION_COOKIE_NAME = 'ctfl_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

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

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    'ctfl-academy-local-dev-secret-key-2026-istqb-v401-secure'
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith('scrypt$')) {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const [, salt, originalKey] = parts;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(originalKey, 'hex');
  const b = Buffer.from(derivedKey, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const fullPayload: SessionPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    exp,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), 'utf-8').toString(
    'base64url'
  );
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getAuthSecret())
      .update(encoded)
      .digest('base64url');
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
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
