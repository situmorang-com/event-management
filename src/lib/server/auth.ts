import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { eq, and, isNull, gt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import { users, sessions, authTokens } from './db/schema';
import { newId, newToken } from '$lib/utils/ids';

const SESSION_COOKIE = 'session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAGIC_LINK_TTL_MS = 1000 * 60 * 15; // 15 min

export const hashToken = (token: string): string =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

// ───────────────────────────── Sessions ─────────────────────────────

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = newToken();
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { token, expiresAt };
}

export async function validateSession(token: string) {
  const id = hashToken(token);
  const row = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: { /* user joined separately for clarity */ }
  });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, row.userId) });
  if (!user) return null;
  // Sliding renewal: extend if < 7 days remaining
  if (row.expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7) {
    const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(sessions).set({ expiresAt: newExpiry }).where(eq(sessions.id, id));
    row.expiresAt = newExpiry;
  }
  return { session: row, user };
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
}

export function setSessionCookie(cookies: Cookies, token: string, expiresAt: Date) {
  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// ───────────────────────────── Magic links ─────────────────────────────

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = newToken();
  await db.insert(authTokens).values({
    id: newId('mlt'),
    email: email.toLowerCase().trim(),
    tokenHash: hashToken(token),
    purpose: 'magic_link',
    expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS)
  });
  return token;
}

export async function consumeMagicLink(
  token: string
): Promise<{ userId: string; email: string } | null> {
  const tokenHash = hashToken(token);
  const row = await db.query.authTokens.findFirst({
    where: and(
      eq(authTokens.tokenHash, tokenHash),
      eq(authTokens.purpose, 'magic_link'),
      isNull(authTokens.usedAt),
      gt(authTokens.expiresAt, new Date())
    )
  });
  if (!row) return null;

  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, row.id));

  // JIT user creation
  let user = await db.query.users.findFirst({ where: eq(users.email, row.email) });
  if (!user) {
    const id = newId('usr');
    await db.insert(users).values({ id, email: row.email });
    user = { id, email: row.email, name: null, createdAt: new Date() };
  }
  return { userId: user.id, email: user.email };
}
