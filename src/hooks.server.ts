import type { Handle } from '@sveltejs/kit';
import {
  SESSION_COOKIE_NAME,
  validateSession,
  setSessionCookie,
  clearSessionCookie
} from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(SESSION_COOKIE_NAME);
  if (!token) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const result = await validateSession(token);
  if (!result) {
    clearSessionCookie(event.cookies);
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  // refresh cookie expiry to mirror sliding session
  setSessionCookie(event.cookies, token, result.session.expiresAt);
  event.locals.user = {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name
  };
  event.locals.session = {
    id: result.session.id,
    expiresAt: result.session.expiresAt
  };

  return resolve(event);
};
