import { error, redirect } from '@sveltejs/kit';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { teamInvitations, teamMembers, teams, users } from '$lib/server/db/schema';
import { hashToken, createMagicLinkToken } from '$lib/server/auth';
import { sendMagicLink } from '$lib/server/email';
import { newId } from '$lib/utils/ids';
import type { Actions, PageServerLoad } from './$types';

async function findInvite(token: string) {
  const tokenHash = hashToken(token);
  const inv = await db.query.teamInvitations.findFirst({
    where: and(
      eq(teamInvitations.tokenHash, tokenHash),
      isNull(teamInvitations.acceptedAt),
      gt(teamInvitations.expiresAt, new Date())
    )
  });
  if (!inv) return null;
  const team = await db.query.teams.findFirst({ where: eq(teams.id, inv.teamId) });
  if (!team) return null;
  return { inv, team };
}

export const load: PageServerLoad = async ({ params, locals }) => {
  const found = await findInvite(params.token);
  if (!found) throw error(404, 'Invitation invalid or expired');
  return {
    invite: { email: found.inv.email, role: found.inv.role },
    team: { name: found.team.name, slug: found.team.slug },
    isSignedIn: !!locals.user,
    matchesEmail: locals.user?.email === found.inv.email
  };
};

export const actions: Actions = {
  accept: async ({ params, locals }) => {
    const found = await findInvite(params.token);
    if (!found) throw error(404, 'Invitation invalid or expired');
    if (!locals.user || locals.user.email !== found.inv.email) {
      throw error(403, 'Sign in with the invited email first');
    }
    // Make sure not already a member
    const existing = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, found.team.id),
        eq(teamMembers.userId, locals.user.id)
      )
    });
    if (!existing) {
      await db.insert(teamMembers).values({
        id: newId('tmem'),
        teamId: found.team.id,
        userId: locals.user.id,
        role: found.inv.role,
        invitedBy: found.inv.invitedBy ?? null
      });
    }
    await db
      .update(teamInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(teamInvitations.id, found.inv.id));
    throw redirect(303, `/t/${found.team.slug}/dashboard`);
  },

  // For signed-out users: send a magic link to the invited email.
  signin: async ({ params }) => {
    const found = await findInvite(params.token);
    if (!found) throw error(404, 'Invitation invalid or expired');
    try {
      const tk = await createMagicLinkToken(found.inv.email);
      await sendMagicLink(found.inv.email, tk);
    } catch (e) {
      console.error('magic link failed', e);
    }
    return { sent: true };
  }
};
