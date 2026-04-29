import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST ?? 'localhost',
  port: Number(env.SMTP_PORT ?? 1025),
  secure: env.SMTP_SECURE === 'true',
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined
});

const FROM = env.MAIL_FROM ?? 'Event Management <noreply@localhost>';
const APP_URL = env.APP_URL ?? 'http://localhost:5173';

export async function sendMagicLink(to: string, token: string) {
  const url = `${APP_URL}/auth/verify?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Your sign-in link',
    text: `Click to sign in: ${url}\n\nThis link expires in 15 minutes.`,
    html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p><p>This link expires in 15 minutes.</p>`
  });
}

export async function sendTeamInvite(to: string, teamName: string, token: string) {
  const url = `${APP_URL}/invite/${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You've been invited to ${teamName}`,
    text: `You've been invited to join ${teamName}. Accept here: ${url}`,
    html: `<p>You've been invited to join <strong>${escapeHtml(teamName)}</strong>.</p><p><a href="${url}">Accept invitation</a></p>`
  });
}

export async function sendTicketConfirmation(opts: {
  to: string;
  attendeeName: string;
  conferenceName: string;
  ticketCode: string;
  qrDataUrl: string;
}) {
  const url = `${APP_URL}/ticket/${encodeURIComponent(opts.ticketCode)}`;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: `Your ticket for ${opts.conferenceName}`,
    text: `Hi ${opts.attendeeName},\n\nYour ticket: ${url}\nCode: ${opts.ticketCode}`,
    html: `
      <p>Hi ${escapeHtml(opts.attendeeName)},</p>
      <p>You're registered for <strong>${escapeHtml(opts.conferenceName)}</strong>.</p>
      <p><img src="${opts.qrDataUrl}" alt="QR code" style="width:240px;height:240px"/></p>
      <p>Code: <code>${opts.ticketCode}</code></p>
      <p><a href="${url}">View your ticket</a></p>
    `
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
}
