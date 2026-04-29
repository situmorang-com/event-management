import { redirect, error } from '@sveltejs/kit';
import { consumeMagicLink, createSession, setSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { teamMembers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');
  if (!token) throw error(400, 'Missing token');

  const result = await consumeMagicLink(token);
  if (!result) throw error(400, 'Invalid or expired link');

  const { token: sessionToken, expiresAt } = await createSession(result.userId);
  setSessionCookie(cookies, sessionToken, expiresAt);

  // If the user is on a team, send them there; otherwise prompt to create one.
  const membership = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, result.userId)
  });
  throw redirect(303, membership ? '/dashboard' : '/teams/new');
};
