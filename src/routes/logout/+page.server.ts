import { redirect } from '@sveltejs/kit';
import { invalidateSession, clearSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const token = cookies.get(SESSION_COOKIE_NAME);
    if (token) await invalidateSession(token);
    clearSessionCookie(cookies);
    throw redirect(303, '/');
  }
};
