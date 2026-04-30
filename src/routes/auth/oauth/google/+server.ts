import { redirect } from '@sveltejs/kit';
import { getGoogleOAuthClient } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { authTokens } from '$lib/server/db/schema';
import { newId, newToken } from '$lib/utils/ids';

export async function GET({ url }) {
  const client = await getGoogleOAuthClient();
  const state = newToken();
  const stateId = newId('oauth');

  // Store state for CSRF verification
  await db.insert(authTokens).values({
    id: stateId,
    email: 'oauth@placeholder.local',
    tokenHash: state,
    purpose: 'oauth_state',
    expiresAt: new Date(Date.now() + 1000 * 60 * 10) // 10 min
  });

  const authUrl = client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'consent'
  });

  throw redirect(302, authUrl);
}
