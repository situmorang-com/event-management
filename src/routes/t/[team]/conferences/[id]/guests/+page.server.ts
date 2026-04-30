import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import QRCode from 'qrcode';
import { db } from '$lib/server/db';
import { attendees, conferences, emailJobs } from '$lib/server/db/schema';
import { newId, newTicketCode } from '$lib/utils/ids';
import { sendTicketConfirmation } from '$lib/server/email';
import { parseCSV } from '$lib/utils/csv';
import { parseVCard } from '$lib/utils/vcard';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['registered', 'confirmed', 'checked_in', 'cancelled'] as const;

export const load: PageServerLoad = async ({ url, parent }) => {
  const { conference } = await parent();

  const q = url.searchParams.get('q')?.trim() ?? '';
  const status = url.searchParams.get('status') ?? '';

  const where = [eq(attendees.conferenceId, conference.id)];
  if (q) {
    const wildcard = `%${q.toLowerCase()}%`;
    where.push(
      or(
        like(sql`lower(${attendees.email})`, wildcard),
        like(sql`lower(${attendees.name})`, wildcard),
        like(sql`lower(coalesce(${attendees.company}, ''))`, wildcard)
      )!
    );
  }
  if (status && (STATUSES as readonly string[]).includes(status)) {
    where.push(eq(attendees.status, status));
  }

  const list = await db
    .select()
    .from(attendees)
    .where(and(...where))
    .orderBy(desc(attendees.registeredAt))
    .limit(500);

  return { guests: list, q, status };
};

const addSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(254),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  role: z.string().trim().max(120).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(30).optional().or(z.literal('')),
  sendEmail: z.union([z.literal('on'), z.literal('off'), z.literal('')]).optional()
});

async function ctx(params: { team: string; id: string }, locals: App.Locals, minRole: 'staff' | 'admin' = 'staff') {
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
  add: async ({ request, locals, params }) => {
    const { conf } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const parsed = addSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: 'Invalid input', values: data });
    const email = parsed.data.email.toLowerCase().trim();

    const existing = await db.query.attendees.findFirst({
      where: and(eq(attendees.conferenceId, conf.id), eq(attendees.email, email))
    });
    if (existing) return fail(409, { error: 'Already registered', values: data });

    const id = newId('att');
    const code = newTicketCode();
    await db.insert(attendees).values({
      id,
      conferenceId: conf.id,
      email,
      name: parsed.data.name,
      company: parsed.data.company || null,
      role: parsed.data.role || null,
      whatsapp: parsed.data.whatsapp || null,
      ticketCode: code,
      status: 'registered'
    });

    if (parsed.data.sendEmail === 'on') {
      try {
        const qr = await QRCode.toDataURL(code, { width: 320, margin: 1 });
        await sendTicketConfirmation({
          to: email,
          attendeeName: parsed.data.name,
          conferenceName: conf.name,
          ticketCode: code,
          qrDataUrl: qr
        });
      } catch (err) {
        console.error('email failed, queuing', err);
        await db.insert(emailJobs).values({
          id: newId('emj'),
          toAddress: email,
          template: 'ticket_confirmation',
          payload: JSON.stringify({
            attendeeName: parsed.data.name,
            conferenceName: conf.name,
            ticketCode: code
          })
        });
      }
    }

    return { added: true };
  },

  cancel: async ({ request, locals, params }) => {
    const { conf } = await ctx(params as any, locals, 'admin');
    const data = Object.fromEntries(await request.formData());
    const id = String(data.id ?? '');
    if (!id) return fail(400, { error: 'Missing id' });
    await db
      .update(attendees)
      .set({ status: 'cancelled' })
      .where(and(eq(attendees.id, id), eq(attendees.conferenceId, conf.id)));
    return { cancelled: true };
  },

  import: async ({ request, locals, params }) => {
    const { conf } = await ctx(params as any, locals, 'admin');
    const fd = await request.formData();
    const file = fd.get('file') as File | null;
    if (!file || file.size === 0) return fail(400, { importError: 'No file uploaded' });
    if (file.size > 2 * 1024 * 1024) return fail(400, { importError: 'File too large (max 2 MB)' });

    const text = await file.text();
    const isVCard = /BEGIN:VCARD/i.test(text.slice(0, 200)) || /\.vcf$/i.test(file.name);
    const rows = isVCard ? parseVCard(text) : parseCSV(text);
    if (rows.length === 0) {
      return fail(400, {
        importError: isVCard
          ? 'No contacts found in vCard file.'
          : 'No rows found. Check that your file has a header row.'
      });
    }

    if (!isVCard) {
      // Require at least name + email columns for CSV
      const sample = rows[0];
      if (!('name' in sample) || !('email' in sample)) {
        return fail(400, { importError: 'CSV must have "name" and "email" columns. Other supported columns: whatsapp, company, role.' });
      }
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const email = (row['email'] ?? '').toLowerCase().trim() || null;
      const whatsapp = (row['whatsapp'] ?? '').trim() || null;
      const name = (row['name'] ?? '').trim();

      if (!name) { errors.push(`Skipped row — no name`); skipped++; continue; }
      if (!email && !whatsapp) { errors.push(`Skipped "${name}" — no email or phone`); skipped++; continue; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Skipped "${name}" — invalid email: ${email}`);
        skipped++;
        continue;
      }

      // Deduplicate: by email if present, else by whatsapp
      const existing = await db.query.attendees.findFirst({
        where: email
          ? and(eq(attendees.conferenceId, conf.id), eq(attendees.email, email))
          : and(eq(attendees.conferenceId, conf.id), eq(attendees.whatsapp, whatsapp!))
      });
      if (existing) { skipped++; continue; }

      await db.insert(attendees).values({
        id: newId('att'),
        conferenceId: conf.id,
        email,
        name,
        company: row['company'] || null,
        role: row['role'] || null,
        whatsapp,
        ticketCode: newTicketCode(),
        status: 'registered'
      });
      imported++;
    }

    return { imported, skipped, importErrors: errors.slice(0, 5) };
  }
};
