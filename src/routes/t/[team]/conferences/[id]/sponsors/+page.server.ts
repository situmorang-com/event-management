import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sponsors, sponsorTiers } from '$lib/server/db/schema';
import { canSeeSensitiveSponsorFields } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
  const { conference, role } = await parent();
  const kind = (url.searchParams.get('kind') as 'sponsor' | 'vendor') || 'sponsor';

  const list = await db
    .select()
    .from(sponsors)
    .where(and(eq(sponsors.conferenceId, conference.id), eq(sponsors.kind, kind)))
    .orderBy(desc(sponsors.createdAt));

  const tiers = await db
    .select()
    .from(sponsorTiers)
    .where(eq(sponsorTiers.conferenceId, conference.id));

  const seeAmount = canSeeSensitiveSponsorFields(role);
  const safe = list.map((s) => ({
    ...s,
    amount: seeAmount ? s.amount : null
  }));

  return { sponsors: safe, tiers, kind, seeAmount };
};
