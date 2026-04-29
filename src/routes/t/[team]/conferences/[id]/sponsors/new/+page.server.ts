import { fail, redirect, error } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sponsors, sponsorTiers, conferences } from '$lib/server/db/schema';
import { newId, slugify } from '$lib/utils/ids';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import type { Actions, PageServerLoad } from './$types';

async function ctx(params: { team: string; id: string }, locals: App.Locals) {
  const user = await requireUser(locals);
  const team = await getTeamBySlug(params.team);
  await requireTeamRole(user.id, team.id, 'admin');
  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Not found');
  return { user, team, conf };
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  await ctx(params as any, locals);
  const { conference } = await parent();
  const tiers = await db
    .select()
    .from(sponsorTiers)
    .where(eq(sponsorTiers.conferenceId, conference.id));
  return { tiers };
};

const schema = z.object({
  kind: z.enum(['sponsor', 'vendor']),
  name: z.string().trim().min(1).max(120),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
  tierId: z.string().optional().or(z.literal('')),
  status: z.enum(['prospect', 'invited', 'confirmed', 'paid', 'declined']),
  amount: z.union([z.coerce.number().nonnegative(), z.literal('').transform(() => undefined)]).optional(),
  contactName: z.string().trim().max(120).optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().trim().max(40).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
  isPublic: z.union([z.literal('on'), z.literal('off'), z.literal('')]).optional()
});

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const { conf, team } = await ctx(params as any, locals);
    const data = Object.fromEntries(await request.formData());
    const parsed = schema.safeParse(data);
    if (!parsed.success) return fail(400, { error: parsed.error.issues[0]?.message ?? 'Invalid', values: data });

    const baseSlug = slugify(parsed.data.name) || 'sponsor';
    let slug = baseSlug;
    let n = 1;
    while (
      await db.query.sponsors.findFirst({
        where: and(eq(sponsors.conferenceId, conf.id), eq(sponsors.slug, slug))
      })
    ) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const id = newId('spn');
    await db.insert(sponsors).values({
      id,
      conferenceId: conf.id,
      kind: parsed.data.kind,
      tierId: parsed.data.tierId || null,
      name: parsed.data.name,
      slug,
      websiteUrl: parsed.data.websiteUrl || null,
      status: parsed.data.status,
      amount: parsed.data.amount != null ? Math.round(parsed.data.amount * 100) : null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      isPublic: parsed.data.isPublic === 'on'
    });

    throw redirect(303, `/t/${team.slug}/conferences/${conf.id}/sponsors/${id}`);
  }
};
