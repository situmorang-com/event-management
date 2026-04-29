import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { assets, teamMembers } from '$lib/server/db/schema';
import { readAssetFile } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const asset = await db.query.assets.findFirst({ where: eq(assets.id, params.assetId) });
  if (!asset) throw error(404, 'Not found');

  if (!asset.isPublic) {
    if (!locals.user) throw error(401, 'Sign in required');
    if (asset.ownerTeamId) {
      const member = await db.query.teamMembers.findFirst({
        where: and(
          eq(teamMembers.teamId, asset.ownerTeamId),
          eq(teamMembers.userId, locals.user.id)
        )
      });
      if (!member) throw error(403, 'Forbidden');
    }
  }

  const buf = readAssetFile(asset.storagePath);
  if (!buf) throw error(404, 'File missing');

  return new Response(new Uint8Array(buf), {
    headers: {
      'content-type': asset.mimeType,
      'cache-control': asset.isPublic ? 'public, max-age=3600' : 'private, no-cache',
      'content-disposition': `inline; filename="${asset.filename.replace(/"/g, '')}"`
    }
  });
};
