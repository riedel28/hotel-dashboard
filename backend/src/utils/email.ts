import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

import env from '../../env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  if (!env.SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        : undefined
  });

  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transport = getTransporter();

  if (!transport) {
    console.log('--- DEV EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log('--- END EMAIL ---');
    return;
  }

  await transport.sendMail({
    from: env.SMTP_FROM || 'noreply@example.com',
    to,
    subject,
    html
  });
}

async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${env.APP_URL}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Welcome!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email Address</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    `
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendInvitationEmail(
  email: string,
  token: string,
  inviterName?: string
) {
  const acceptUrl = `${env.APP_URL}/auth/accept-invitation?token=${token}`;
  const inviterText = inviterName ? ` by ${escapeHtml(inviterName)}` : '';

  await sendEmail({
    to: email,
    subject: "You've been invited",
    html: `
      <h2>You've been invited${inviterText}!</h2>
      <p>You've been invited to join the dashboard. Click the link below to set your password and activate your account:</p>
      <p><a href="${acceptUrl}">Accept Invitation</a></p>
      <p>This link will expire in 7 days.</p>
      <p>If you were not expecting this invitation, you can safely ignore this email.</p>
    `
  });
}

export { sendEmail, sendVerificationEmail, sendInvitationEmail };
