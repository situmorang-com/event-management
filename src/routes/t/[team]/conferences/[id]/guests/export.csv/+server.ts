import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { attendees, conferences } from '$lib/server/db/schema';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import type { RequestHandler } from './$types';

const csvEscape = (v: string | null | undefined) => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: RequestHandler = async ({ params, locals }) => {
  const user = await requireUser(locals);
  const team = await getTeamBySlug(params.team);
  await requireTeamRole(user.id, team.id, 'staff');

  const conf = await db.query.conferences.findFirst({
    where: and(eq(conferences.id, params.id), eq(conferences.teamId, team.id))
  });
  if (!conf) throw error(404, 'Not found');

  const rows = await db
    .select()
    .from(attendees)
    .where(eq(attendees.conferenceId, conf.id));

  const header = ['name', 'email', 'company', 'role', 'status', 'ticket_code', 'registered_at', 'checked_in_at'];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.name,
        r.email,
        r.company,
        r.role,
        r.status,
        r.ticketCode,
        r.registeredAt instanceof Date ? r.registeredAt.toISOString() : '',
        r.checkedInAt instanceof Date ? r.checkedInAt.toISOString() : ''
      ]
        .map(csvEscape)
        .join(',')
    )
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${conf.slug}-guests.csv"`
    }
  });
};
