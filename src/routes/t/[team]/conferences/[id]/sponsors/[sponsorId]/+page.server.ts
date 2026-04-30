import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
  sponsors,
  sponsorTiers,
  sponsorDeliverables,
  conferences,
  assets
} from '$lib/server/db/schema';
import { newId } from '$lib/utils/ids';
import {
  canSeeSensitiveSponsorFields,
  getTeamBySlug,
  requireTeamRole,
  requireUser
} from '$lib/server/permissions';
import { saveUpload } from '$lib/server/storage';
import type { Actions, PageServerLoad } from './$types';

async function ctx(
  params: { team: string; id: string; sponsorId: string },
  locals: App.Locals,
  minRole: 'staff' | 'admin' = 'admin'
) {
  const user = await requireUser(locals);
  const team = await getTeamBySlug(params.team);
  const { role } = await requireTeamRole(user.id, team.id, minRole);
  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Conference not found');
  const sponsor = await db.query.sponsors.findFirst({
    where: and(eq(sponsors.id, params.sponsorId), eq(sponsors.conferenceId, conf.id))
  });
  if (!sponsor) throw error(404, 'Sponsor not found');
  return { user, team, conf, sponsor, role };
}

export const load: PageServerLoad = async ({ params, locals, parent }) => {
  // staff can view, admin required to mutate
  const user = await requireUser(locals);
  const { team, role } = await parent();
  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Conference not found');
  const sponsor = await db.query.sponsors.findFirst({
    where: and(eq(sponsors.id, params.sponsorId), eq(sponsors.conferenceId, conf.id))
  });
  if (!sponsor) throw error(404, 'Sponsor not found');

  const tiers = await db
    .select()
    .from(sponsorTiers)
    .where(eq(sponsorTiers.conferenceId, conf.id));

  const deliverables = await db
    .select()
    .from(sponsorDeliverables)
    .where(eq(sponsorDeliverables.sponsorId, sponsor.id))
    .orderBy(asc(sponsorDeliverables.dueDate));

  // Strip sensitive fields if necessary
  const safe = canSeeSensitiveSponsorFields(role)
    ? sponsor
    : { ...sponsor, amount: null, contractAssetId: null, notes: null };

  return { sponsor: safe, tiers, deliverables, canEdit: role !== 'staff' };
};

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
  tierId: z.string().optional().or(z.literal('')),
  status: z.enum(['prospect', 'invited', 'confirmed', 'paid', 'declined']),
  amount: z.union([z.coerce.number().nonnegative(), z.literal('').transform(() => undefined)]).optional(),
  contactName: z.string().trim().max(120).optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().trim().max(40).optional().or(z.literal('')),
  contactWhatsapp: z.string().trim().max(30).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
  isPublic: z.union([z.literal('on'), z.literal('off'), z.literal('')]).optional()
});

const deliverableSchema = z.object({
  title: z.string().trim().min(1).max(200),
  dueDate: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal(''))
});

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    const { sponsor, conf } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const parsed = updateSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: parsed.error.issues[0]?.message ?? 'Invalid' });
    await db
      .update(sponsors)
      .set({
        name: parsed.data.name,
        websiteUrl: parsed.data.websiteUrl || null,
        tierId: parsed.data.tierId || null,
        status: parsed.data.status,
        amount: parsed.data.amount != null ? Math.round(parsed.data.amount * 100) : null,
        contactName: parsed.data.contactName || null,
        contactEmail: parsed.data.contactEmail || null,
        contactPhone: parsed.data.contactPhone || null,
        contactWhatsapp: parsed.data.contactWhatsapp || null,
        description: parsed.data.description || null,
        notes: parsed.data.notes || null,
        isPublic: parsed.data.isPublic === 'on',
        updatedAt: new Date()
      })
      .where(and(eq(sponsors.id, sponsor.id), eq(sponsors.conferenceId, conf.id)));
    return { saved: true };
  },

  uploadLogo: async ({ request, locals, params }) => {
    const { sponsor, team, user } = await ctx(params as any, locals, 'admin');
    const fd = await request.formData();
    const file = fd.get('file') as File | null;
    if (!file) return fail(400, { error: 'No file' });
    const result = await saveUpload({
      file,
      kind: 'logo_light',
      isPublic: true,
      ownerTeamId: team.id,
      sponsorId: sponsor.id,
      uploadedBy: user.id
    });
    if ('error' in result) return fail(400, { error: result.error });
    await db.update(sponsors).set({ logoAssetId: result.id }).where(eq(sponsors.id, sponsor.id));
    return { uploaded: true };
  },

  uploadContract: async ({ request, locals, params }) => {
    const { sponsor, team, user } = await ctx(params as any, locals, 'admin');
    const fd = await request.formData();
    const file = fd.get('file') as File | null;
    if (!file) return fail(400, { error: 'No file' });
    const result = await saveUpload({
      file,
      kind: 'contract',
      isPublic: false,
      ownerTeamId: team.id,
      sponsorId: sponsor.id,
      uploadedBy: user.id
    });
    if ('error' in result) return fail(400, { error: result.error });
    await db.update(sponsors).set({ contractAssetId: result.id }).where(eq(sponsors.id, sponsor.id));
    return { uploaded: true };
  },

  addDeliverable: async ({ request, locals, params }) => {
    const { sponsor } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const parsed = deliverableSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: 'Invalid' });
    await db.insert(sponsorDeliverables).values({
      id: newId('dlv'),
      sponsorId: sponsor.id,
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes || null
    });
    return { saved: true };
  },

  toggleDeliverable: async ({ request, locals, params }) => {
    await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    const done = data.done === 'true';
    await db
      .update(sponsorDeliverables)
      .set({ doneAt: done ? new Date() : null })
      .where(eq(sponsorDeliverables.id, id));
    return { saved: true };
  },

  deleteDeliverable: async ({ request, locals, params }) => {
    await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    await db.delete(sponsorDeliverables).where(eq(sponsorDeliverables.id, id));
    return { deleted: true };
  },

  delete: async ({ locals, params }) => {
    const { sponsor, team, conf } = await ctx(params as any, locals, 'admin');
    await db.delete(sponsors).where(eq(sponsors.id, sponsor.id));
    throw redirect(303, `/t/${team.slug}/conferences/${conf.id}/sponsors`);
  }
};
