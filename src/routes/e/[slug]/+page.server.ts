import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { conferences, sponsors, sponsorTiers } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const conf = await db.query.conferences.findFirst({
    where: eq(conferences.slug, params.slug)
  });
  if (!conf || conf.status !== 'published') throw error(404, 'Not found');

  // Public sponsor wall — pick fields explicitly to avoid leaking amount/contract.
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
    .where(eq(sponsors.conferenceId, conf.id));

  return {
    conference: {
      slug: conf.slug,
      name: conf.name,
      description: conf.description,
      venue: conf.venue,
      startsAt: conf.startsAt,
      endsAt: conf.endsAt
    },
    tiers,
    sponsors: publicSponsors.filter((s) => s) // is_public filter would go here
  };
};
