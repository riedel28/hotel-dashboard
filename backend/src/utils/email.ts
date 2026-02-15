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

function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td>
          ${content}
          <p style="margin-top:32px; padding-top:16px; border-top:1px solid #e4e4e7; color:#a1a1aa; font-size:13px; line-height:1.5;">
            Hotel Dashboard
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${env.APP_URL}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: emailLayout(`
      <h2 style="margin:0 0 8px; font-size:22px; font-weight:600; color:#18181b;">Welcome!</h2>
      <p style="margin:0 0 24px; color:#52525b; font-size:15px; line-height:1.6;">Please verify your email address by clicking the button below:</p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="${verifyUrl}" style="display:inline-block; padding:10px 24px; background-color:#1e3a8a; color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px; font-weight:500;">Verify Email Address</a>
      </td></tr></table>
      <p style="margin:24px 0 0; color:#71717a; font-size:13px; line-height:1.5;">This link will expire in 24 hours.</p>
      <p style="margin:8px 0 0; color:#71717a; font-size:13px; line-height:1.5;">If you did not create an account, you can safely ignore this email.</p>
    `)
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
    html: emailLayout(`
      <h2 style="margin:0 0 8px; font-size:22px; font-weight:600; color:#18181b;">You've been invited${inviterText}!</h2>
      <p style="margin:0 0 24px; color:#52525b; font-size:15px; line-height:1.6;">You've been invited to join the dashboard. Click the button below to set your password and activate your account:</p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="${acceptUrl}" style="display:inline-block; padding:10px 24px; background-color:#1e3a8a; color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px; font-weight:500;">Accept Invitation</a>
      </td></tr></table>
      <p style="margin:24px 0 0; color:#71717a; font-size:13px; line-height:1.5;">This link will expire in 7 days.</p>
      <p style="margin:8px 0 0; color:#71717a; font-size:13px; line-height:1.5;">If you were not expecting this invitation, you can safely ignore this email.</p>
    `)
  });
}

async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.APP_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: emailLayout(`
      <h2 style="margin:0 0 8px; font-size:22px; font-weight:600; color:#18181b;">Reset your password</h2>
      <p style="margin:0 0 24px; color:#52525b; font-size:15px; line-height:1.6;">Click the button below to reset your password:</p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 24px; background-color:#1e3a8a; color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px; font-weight:500;">Reset Password</a>
      </td></tr></table>
      <p style="margin:24px 0 0; color:#71717a; font-size:13px; line-height:1.5;">This link will expire in 1 hour.</p>
      <p style="margin:8px 0 0; color:#71717a; font-size:13px; line-height:1.5;">If you did not request a password reset, you can safely ignore this email.</p>
    `)
  });
}

export {
  sendEmail,
  sendVerificationEmail,
  sendInvitationEmail,
  sendPasswordResetEmail
};
