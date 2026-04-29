import { eq, count, and, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { attendees, sponsors } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { conference, role } = await parent();

  const [reg] = await db
    .select({ n: count() })
    .from(attendees)
    .where(
      and(
        eq(attendees.conferenceId, conference.id),
        sql`${attendees.status} != 'cancelled'`
      )
    );
  const [checkedIn] = await db
    .select({ n: count() })
    .from(attendees)
    .where(
      and(eq(attendees.conferenceId, conference.id), eq(attendees.status, 'checked_in'))
    );
  const [sponsorCount] = await db
    .select({ n: count() })
    .from(sponsors)
    .where(eq(sponsors.conferenceId, conference.id));

  let totalRaised: number | null = null;
  if (role === 'owner' || role === 'admin') {
    const [sum] = await db
      .select({ s: sql<number>`COALESCE(SUM(${sponsors.amount}), 0)` })
      .from(sponsors)
      .where(
        and(
          eq(sponsors.conferenceId, conference.id),
          sql`${sponsors.status} IN ('confirmed','paid')`
        )
      );
    totalRaised = Number(sum?.s ?? 0);
  }

  return {
    stats: {
      registered: reg?.n ?? 0,
      checkedIn: checkedIn?.n ?? 0,
      sponsors: sponsorCount?.n ?? 0,
      totalRaised
    }
  };
};
