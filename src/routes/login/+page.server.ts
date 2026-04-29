import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { createMagicLinkToken } from '$lib/server/auth';
import { sendMagicLink } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) throw redirect(303, '/dashboard');
};

const schema = z.object({ email: z.string().email().max(254) });

export const actions: Actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: 'Enter a valid email.', email: String(data.email ?? '') });
    }
    const email = parsed.data.email.toLowerCase().trim();
    try {
      const token = await createMagicLinkToken(email);
      await sendMagicLink(email, token);
    } catch (err) {
      console.error('magic link send failed', err);
      // Don't leak: still show success to caller.
    }
    return { sent: true, email };
  }
};
