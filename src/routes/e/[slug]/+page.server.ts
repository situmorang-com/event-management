import { error, fail } from '@sveltejs/kit';
import { eq, and, count, sql } from 'drizzle-orm';
import { z } from 'zod';
import QRCode from 'qrcode';
import { db } from '$lib/server/db';
import {
  conferences,
  sponsors,
  sponsorTiers,
  attendees,
  emailJobs
} from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import { newId, newTicketCode } from '$lib/utils/ids';
import { sendTicketConfirmation } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

async function loadConference(slug: string) {
  const conf = await db.query.conferences.findFirst({ where: eq(conferences.slug, slug) });
  if (!conf || conf.status !== 'published') throw error(404, 'Not found');
  return conf;
}

export const load: PageServerLoad = async ({ params }) => {
  const conf = await loadConference(params.slug);

  const [registeredRow] = await db
    .select({ n: count() })
    .from(attendees)
    .where(
      and(
        eq(attendees.conferenceId, conf.id),
        sql`${attendees.status} != 'cancelled'`
      )
    );
  const registered = registeredRow?.n ?? 0;
  const isFull = conf.capacity != null && registered >= conf.capacity;
  const isClosed = conf.registrationCloseAt != null && conf.registrationCloseAt < new Date();

  const tiers = await db
    .select({ id: sponsorTiers.id, name: sponsorTiers.name, rank: sponsorTiers.rank })
    .from(sponsorTiers)
    .where(eq(sponsorTiers.conferenceId, conf.id));

  const publicSponsors = await db
    .select({
      id: sponsors.id,
      name: sponsors.name,
      websiteUrl: sponsors.websiteUrl,
      logoAssetId: sponsors.logoAssetId,
      tierId: sponsors.tierId,
      displayOrder: sponsors.displayOrder
    })
    .from(sponsors)
    .where(
      and(
        eq(sponsors.conferenceId, conf.id),
        eq(sponsors.isPublic, true),
        sql`${sponsors.status} IN ('confirmed','paid')`
      )
    );

  const publicAttendees = await db
    .select({
      company: attendees.company,
      role: attendees.role,
      companySize: attendees.companySize,
      industry: attendees.industry
    })
    .from(attendees)
    .where(
      and(
        eq(attendees.conferenceId, conf.id),
        sql`${attendees.status} != 'cancelled'`
      )
    )
    .orderBy(asc(attendees.registeredAt));

  return {
    conference: {
      slug: conf.slug,
      name: conf.name,
      description: conf.description,
      bannerUrl: conf.bannerUrl,
      venue: conf.venue,
      timezone: conf.timezone,
      startsAt: conf.startsAt,
      endsAt: conf.endsAt,
      capacity: conf.capacity
    },
    registered,
    isFull,
    isClosed,
    tiers,
    sponsors: publicSponsors,
    attendees: publicAttendees.filter(a => a.company || a.role)
  };
};

const regSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(254),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  companySize: z.string().trim().max(60).optional().or(z.literal('')),
  industry: z.string().trim().max(120).optional().or(z.literal('')),
  role: z.string().trim().max(120).optional().or(z.literal('')),
  whatsapp: z.string().trim().min(1, 'WhatsApp number is required').max(30)
});

export const actions: Actions = {
  default: async ({ request, params }) => {
    const conf = await loadConference(params.slug);
    const data = Object.fromEntries(await request.formData());
    const parsed = regSchema.safeParse(data);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Invalid input',
        values: data
      });
    }
    const email = parsed.data.email.toLowerCase().trim();

    type TxResult =
      | { kind: 'created'; id: string; ticketCode: string; name: string; email: string }
      | { kind: 'dup'; ticketCode: string };

    let outcome: TxResult;
    try {
      outcome = db.transaction((tx): TxResult => {
        const existing = tx
          .select()
          .from(attendees)
          .where(and(eq(attendees.conferenceId, conf.id), eq(attendees.email, email)))
          .all();
        if (existing.length > 0) {
          return { kind: 'dup', ticketCode: existing[0].ticketCode };
        }
        if (conf.capacity != null) {
          const [{ n }] = tx
            .select({ n: count() })
            .from(attendees)
            .where(
              and(
                eq(attendees.conferenceId, conf.id),
                sql`${attendees.status} != 'cancelled'`
              )
            )
            .all();
          if (n >= conf.capacity) throw new Error('FULL');
        }
        if (conf.registrationCloseAt && conf.registrationCloseAt < new Date()) {
          throw new Error('CLOSED');
        }
        const id = newId('att');
        const code = newTicketCode();
        tx.insert(attendees)
          .values({
            id,
            conferenceId: conf.id,
            email,
            name: parsed.data.name,
            company: parsed.data.company || null,
            companySize: parsed.data.companySize || null,
            industry: parsed.data.industry || null,
            role: parsed.data.role || null,
            whatsapp: parsed.data.whatsapp || null,
            ticketCode: code,
            status: 'registered'
          })
          .run();
        return { kind: 'created', id, ticketCode: code, name: parsed.data.name, email };
      });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === 'FULL') return fail(409, { error: 'Sold out.', values: data });
      if (msg === 'CLOSED') return fail(409, { error: 'Registration closed.', values: data });
      throw e;
    }

    if (outcome.kind === 'dup') {
      return { ok: true, ticketCode: outcome.ticketCode, dedup: true };
    }
    const attendee = outcome;

    // Send ticket email synchronously (best effort). Queue a record for retry if it fails.
    try {
      const qrDataUrl = await QRCode.toDataURL(attendee.ticketCode, { width: 320, margin: 1 });
      await sendTicketConfirmation({
        to: attendee.email,
        attendeeName: attendee.name,
        conferenceName: conf.name,
        ticketCode: attendee.ticketCode,
        qrDataUrl
      });
    } catch (err) {
      console.error('ticket email failed, queuing', err);
      await db.insert(emailJobs).values({
        id: newId('emj'),
        toAddress: attendee.email,
        template: 'ticket_confirmation',
        payload: JSON.stringify({
          attendeeName: attendee.name,
          conferenceName: conf.name,
          ticketCode: attendee.ticketCode
        })
      });
    }

    return { ok: true, ticketCode: attendee.ticketCode };
  }
};
