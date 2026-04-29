import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { conferences } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { team } = await parent();
  const list = await db
    .select()
    .from(conferences)
    .where(eq(conferences.teamId, team.id))
    .orderBy(desc(conferences.startsAt));
  return { conferences: list };
};
