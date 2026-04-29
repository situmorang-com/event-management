import { customAlphabet, nanoid } from 'nanoid';

// URL-safe, no ambiguous chars
const ticketAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

export const newId = (prefix?: string) => (prefix ? `${prefix}_${nanoid(16)}` : nanoid(21));
export const newTicketCode = customAlphabet(ticketAlphabet, 12);
export const newToken = () => nanoid(32);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
