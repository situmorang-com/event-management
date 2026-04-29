import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { conferences } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, parent }) => {
  const { team } = await parent();
  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Conference not found');
  return { conference: conf };
};
