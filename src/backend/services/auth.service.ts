import crypto from 'crypto';
import type { UserRole } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'ctfl_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

export function getAuthSecret(): string {
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
