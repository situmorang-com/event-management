import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { attendees, conferences } from '$lib/server/db/schema';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = await requireUser(locals);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.code !== 'string' || typeof body.teamSlug !== 'string' || typeof body.conferenceId !== 'string') {
    throw error(400, 'Missing fields');
  }

  const team = await getTeamBySlug(body.teamSlug);
  await requireTeamRole(user.id, team.id, 'staff');

  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, body.conferenceId), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Conference not found');

  const code = String(body.code).trim();
  const att = await db.query.attendees.findFirst({
    where: and(eq(attendees.ticketCode, code), eq(attendees.conferenceId, conf.id))
  });
  if (!att) return json({ ok: false, reason: 'unknown', message: 'Ticket not found for this conference' }, { status: 404 });

  if (att.status === 'cancelled') {
    return json({ ok: false, reason: 'cancelled', name: att.name }, { status: 409 });
  }
  if (att.status === 'checked_in' && att.checkedInAt) {
    return json({
      ok: false,
      reason: 'already',
      name: att.name,
      company: att.company,
      checkedInAt: att.checkedInAt.toISOString()
    });
  }

  await db
    .update(attendees)
    .set({ status: 'checked_in', checkedInAt: new Date(), checkedInBy: user.id })
    .where(eq(attendees.id, att.id));

  return json({ ok: true, name: att.name, company: att.company });
};
