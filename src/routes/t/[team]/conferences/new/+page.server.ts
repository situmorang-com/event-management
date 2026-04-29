import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { conferences } from '$lib/server/db/schema';
import { newId, slugify } from '$lib/utils/ids';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import type { Actions } from './$types';

const schema = z
  .object({
    name: z.string().trim().min(2).max(120),
    venue: z.string().trim().max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    capacity: z.coerce.number().int().positive().optional()
  })
  .refine((d) => d.endsAt > d.startsAt, { message: 'End must be after start' });

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const user = await requireUser(locals);
    const team = await getTeamBySlug(params.team);
    await requireTeamRole(user.id, team.id, 'admin');

    const data = Object.fromEntries(await request.formData());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: parsed.error.issues[0]?.message ?? 'Invalid input', values: data });
    }

    const baseSlug = slugify(parsed.data.name) || 'conference';
    let slug = baseSlug;
    let n = 1;
    while (await db.query.conferences.findFirst({ where: eq(conferences.slug, slug) })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const id = newId('conf');
    await db.insert(conferences).values({
      id,
      teamId: team.id,
      slug,
      name: parsed.data.name,
      venue: parsed.data.venue,
      description: parsed.data.description,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      capacity: parsed.data.capacity
    });

    throw redirect(303, `/t/${team.slug}/conferences/${id}`);
  }
};
