import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { teams, teamMembers } from '$lib/server/db/schema';
import { newId, slugify } from '$lib/utils/ids';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/login');
};

const schema = z.object({ name: z.string().trim().min(2).max(80) });

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    const data = Object.fromEntries(await request.formData());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: 'Name must be 2-80 characters.', name: String(data.name ?? '') });
    }

    const baseSlug = slugify(parsed.data.name) || 'team';
    let slug = baseSlug;
    let n = 1;
    while (await db.query.teams.findFirst({ where: eq(teams.slug, slug) })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const teamId = newId('tm');
    await db.insert(teams).values({ id: teamId, slug, name: parsed.data.name });
    await db.insert(teamMembers).values({
      id: newId('tmem'),
      teamId,
      userId: locals.user.id,
      role: 'owner'
    });

    throw redirect(303, `/t/${slug}/dashboard`);
  }
};
