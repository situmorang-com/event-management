import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { teamMembers, teams } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/login');

  const memberships = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamName: teams.name,
      teamSlug: teams.slug
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, locals.user.id));

  if (memberships.length === 0) throw redirect(303, '/teams/new');
  if (memberships.length === 1) throw redirect(303, `/t/${memberships[0].teamSlug}/dashboard`);

  return { memberships };
};
