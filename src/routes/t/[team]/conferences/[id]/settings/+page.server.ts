import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { conferences } from '$lib/server/db/schema';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import { error } from '@sveltejs/kit';
import type { Actions } from './$types';

const editSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    venue: z.string().trim().max(200).optional().or(z.literal('')),
    description: z.string().trim().max(5000).optional().or(z.literal('')),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    capacity: z
      .union([z.coerce.number().int().positive(), z.literal('').transform(() => undefined)])
      .optional()
  })
  .refine((d) => d.endsAt > d.startsAt, { message: 'End must be after start' });

const statusSchema = z.object({
  status: z.enum(['draft', 'published', 'closed', 'archived'])
});

async function loadContext(params: { team: string; id: string }, locals: App.Locals, minRole: 'admin' | 'staff' | 'owner') {
  const user = await requireUser(locals);
  const team = await getTeamBySlug(params.team);
  await requireTeamRole(user.id, team.id, minRole);
  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Conference not found');
  return { user, team, conf };
}

export const actions: Actions = {
  edit: async ({ request, locals, params }) => {
    const { conf } = await loadContext(params as { team: string; id: string }, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const parsed = editSchema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    }
    await db
      .update(conferences)
      .set({
        name: parsed.data.name,
        venue: parsed.data.venue || null,
        description: parsed.data.description || null,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        capacity: parsed.data.capacity ?? null
      })
      .where(eq(conferences.id, conf.id));
    return { saved: true };
  },

  status: async ({ request, locals, params }) => {
    const { conf } = await loadContext(params as { team: string; id: string }, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const parsed = statusSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: 'Invalid status' });
    await db
      .update(conferences)
      .set({ status: parsed.data.status })
      .where(eq(conferences.id, conf.id));
    return { saved: true };
  }
};
