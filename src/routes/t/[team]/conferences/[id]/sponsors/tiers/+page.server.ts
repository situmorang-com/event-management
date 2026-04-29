import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sponsorTiers, conferences } from '$lib/server/db/schema';
import { newId } from '$lib/utils/ids';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

async function ctx(params: { team: string; id: string }, locals: App.Locals, minRole: 'admin' | 'staff') {
  const user = await requireUser(locals);
  const team = await getTeamBySlug(params.team);
  await requireTeamRole(user.id, team.id, minRole);
  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Not found');
  return { user, team, conf };
}

export const load: PageServerLoad = async ({ parent }) => {
  const { conference } = await parent();
  const tiers = await db
    .select()
    .from(sponsorTiers)
    .where(eq(sponsorTiers.conferenceId, conference.id))
    .orderBy(desc(sponsorTiers.rank));
  return { tiers };
};

const tierSchema = z.object({
  name: z.string().trim().min(1).max(60),
  rank: z.coerce.number().int(),
  price: z
    .union([z.coerce.number().int().nonnegative(), z.literal('').transform(() => undefined)])
    .optional(),
  color: z.string().trim().max(20).optional().or(z.literal('')),
  benefits: z.string().trim().max(2000).optional().or(z.literal(''))
});

export const actions: Actions = {
  create: async ({ request, locals, params }) => {
    const { conf } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const parsed = tierSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: 'Invalid input' });
    await db.insert(sponsorTiers).values({
      id: newId('tier'),
      conferenceId: conf.id,
      name: parsed.data.name,
      rank: parsed.data.rank,
      price: parsed.data.price != null ? Math.round(parsed.data.price * 100) : null,
      color: parsed.data.color || null,
      benefits: parsed.data.benefits || null
    });
    return { saved: true };
  },

  update: async ({ request, locals, params }) => {
    const { conf } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    if (!id) return fail(400, { error: 'Missing id' });
    const parsed = tierSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: 'Invalid input' });
    await db
      .update(sponsorTiers)
      .set({
        name: parsed.data.name,
        rank: parsed.data.rank,
        price: parsed.data.price != null ? Math.round(parsed.data.price * 100) : null,
        color: parsed.data.color || null,
        benefits: parsed.data.benefits || null
      })
      .where(and(eq(sponsorTiers.id, id), eq(sponsorTiers.conferenceId, conf.id)));
    return { saved: true };
  },

  delete: async ({ request, locals, params }) => {
    const { conf } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    if (!id) return fail(400, { error: 'Missing id' });
    await db
      .delete(sponsorTiers)
      .where(and(eq(sponsorTiers.id, id), eq(sponsorTiers.conferenceId, conf.id)));
    return { deleted: true };
  }
};
