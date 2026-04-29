import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';
import { db } from '$lib/server/db';
import { attendees, conferences } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const a = await db.query.attendees.findFirst({
    where: eq(attendees.ticketCode, params.code)
  });
  if (!a) throw error(404, 'Ticket not found');
  const conf = await db.query.conferences.findFirst({
    where: eq(conferences.id, a.conferenceId)
  });
  if (!conf) throw error(404, 'Conference not found');

  const qr = await QRCode.toDataURL(a.ticketCode, { width: 320, margin: 1 });

  return {
    ticket: {
      code: a.ticketCode,
      name: a.name,
      status: a.status,
      qr
    },
    conference: {
      name: conf.name,
      venue: conf.venue,
      startsAt: conf.startsAt
    }
  };
};
