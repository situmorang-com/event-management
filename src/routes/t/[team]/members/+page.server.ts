import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { teamMembers, teamInvitations, users } from '$lib/server/db/schema';
import { newId, newToken } from '$lib/utils/ids';
import { hashToken } from '$lib/server/auth';
import { sendTeamInvite } from '$lib/server/email';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { team } = await parent();
  const members = await db
    .select({
      id: teamMembers.id,
      role: teamMembers.role,
      userId: teamMembers.userId,
      email: users.email,
      name: users.name,
      joinedAt: teamMembers.joinedAt
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, team.id))
    .orderBy(desc(teamMembers.joinedAt));

  const pending = await db
    .select()
    .from(teamInvitations)
    .where(and(eq(teamInvitations.teamId, team.id), isNull(teamInvitations.acceptedAt)))
    .orderBy(desc(teamInvitations.createdAt));

  return { members, pending };
};

const inviteSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(['admin', 'staff'])
});

export const actions: Actions = {
  invite: async ({ request, locals, params }) => {
    const user = await requireUser(locals);
    const team = await getTeamBySlug(params.team);
    await requireTeamRole(user.id, team.id, 'owner');

    const data = Object.fromEntries(await request.formData());
    const parsed = inviteSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: 'Invalid email or role' });
    const email = parsed.data.email.toLowerCase().trim();

    const token = newToken();
    await db.insert(teamInvitations).values({
      id: newId('inv'),
      teamId: team.id,
      email,
      role: parsed.data.role,
      tokenHash: hashToken(token),
      invitedBy: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    });
    try {
      await sendTeamInvite(email, team.name, token);
    } catch (err) {
      console.error('invite send failed', err);
    }
    return { invited: true };
  },

  removeMember: async ({ request, locals, params }) => {
    const user = await requireUser(locals);
    const team = await getTeamBySlug(params.team);
    await requireTeamRole(user.id, team.id, 'owner');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    if (!id) return fail(400, { error: 'Missing id' });

    // Don't let the last owner remove themselves
    const target = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.id, id), eq(teamMembers.teamId, team.id))
    });
    if (!target) return fail(404, { error: 'Not found' });
    if (target.role === 'owner') {
      const owners = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')));
      if (owners.length <= 1) return fail(400, { error: 'Cannot remove the last owner' });
    }
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return { removed: true };
  },

  setRole: async ({ request, locals, params }) => {
    const user = await requireUser(locals);
    const team = await getTeamBySlug(params.team);
    await requireTeamRole(user.id, team.id, 'owner');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    const role = String(data.role ?? '');
    if (!['owner', 'admin', 'staff'].includes(role)) return fail(400, { error: 'Bad role' });
    await db
      .update(teamMembers)
      .set({ role: role as 'owner' | 'admin' | 'staff' })
      .where(and(eq(teamMembers.id, id), eq(teamMembers.teamId, team.id)));
    return { saved: true };
  },

  cancelInvite: async ({ request, locals, params }) => {
    const user = await requireUser(locals);
    const team = await getTeamBySlug(params.team);
    await requireTeamRole(user.id, team.id, 'owner');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    await db
      .delete(teamInvitations)
      .where(and(eq(teamInvitations.id, id), eq(teamInvitations.teamId, team.id)));
    return { cancelled: true };
  }
};
