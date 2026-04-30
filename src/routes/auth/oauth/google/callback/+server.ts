import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { validateGoogleIdToken, getGoogleOAuthClient, createSession, setSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users, authTokens } from '$lib/server/db/schema';
import { newId } from '$lib/utils/ids';

export async function GET({ url, cookies, locals }) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    throw redirect(303, '/login?error=missing_params');
  }

  // Verify state exists and hasn't expired
  const stateRecord = await db.query.authTokens.findFirst({
    where: eq(authTokens.tokenHash, state)
  });

  if (!stateRecord || stateRecord.purpose !== 'oauth_state') {
    throw redirect(303, '/login?error=invalid_state');
  }

  if (stateRecord.expiresAt.getTime() < Date.now()) {
    await db.delete(authTokens).where(eq(authTokens.id, stateRecord.id));
    throw redirect(303, '/login?error=state_expired');
  }

  // Mark state as used
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, stateRecord.id));

  // Exchange code for token
  const client = await getGoogleOAuthClient();
  let tokens;
  try {
    const result = await client.getToken(code);
    tokens = result.tokens;
  } catch {
    throw redirect(303, '/login?error=token_exchange_failed');
  }

  if (!tokens.id_token) {
    throw redirect(303, '/login?error=no_id_token');
  }

  // Validate ID token and extract user info
  const googleUser = await validateGoogleIdToken(tokens.id_token);
  if (!googleUser) {
    throw redirect(303, '/login?error=invalid_token');
  }

  // Look up or JIT create user
  let user = await db.query.users.findFirst({
    where: eq(users.email, googleUser.email)
  });

  const isFirstLogin = !user;

  if (!user) {
    const id = newId('usr');
    // Auto-promote edmundsitumorang@gmail.com as admin
    const isAdmin = googleUser.email === 'edmundsitumorang@gmail.com';
    await db.insert(users).values({
      id,
      email: googleUser.email,
      name: googleUser.name,
      isAdmin
    });
    user = {
      id,
      email: googleUser.email,
      name: googleUser.name,
      isAdmin,
      createdAt: new Date()
    };
  }

  // Create session
  const { token, expiresAt } = await createSession(user.id);
  setSessionCookie(cookies, token, expiresAt);

  // Redirect to dashboard or team setup
  if (isFirstLogin) {
    throw redirect(303, '/teams/new');
  }
  throw redirect(303, '/dashboard');
}
