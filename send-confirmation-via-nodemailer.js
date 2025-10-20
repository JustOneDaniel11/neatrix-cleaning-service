#!/usr/bin/env node
'use strict';

// Nodemailer-based confirmation email sender.
// Generates a Supabase action link (signup) using the Service Role Key,
// then sends a branded HTML email via SMTP (Gmail recommended) or Ethereal test.
//
// Usage:
//   node send-confirmation-via-nodemailer.js <email> [redirectUrl]
// Env (recommended):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   SMTP_USER, SMTP_PASS, [SMTP_HOST=smtp.gmail.com], [SMTP_PORT=465], [SMTP_SECURE=true]
//   [SMTP_FROM_NAME="Neatrix Professional Cleaning"], [SMTP_FROM_EMAIL=SMTP_USER]
//   [NODEMAILER_USE_ETHEREAL=1]  # fallback test account if SMTP creds missing

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local first, then .env
const envLocalPath = path.join(__dirname, '.env.local');
const envPathToUse = fs.existsSync(envLocalPath) ? envLocalPath : path.join(__dirname, '.env');
dotenv.config({ path: envPathToUse });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Neatrix Professional Cleaning';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;

const useEthereal = !!process.env.NODEMAILER_USE_ETHEREAL || !SMTP_USER || !SMTP_PASS;

async function generateConfirmationLink(email, redirectTo) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    const sep = redirectTo.includes('?') ? '&' : '?';
    console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Using placeholder confirm link.');
    return `${redirectTo}${sep}email=${encodeURIComponent(email)}&note=placeholder_no_service_role_key`;
  }
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo },
    });
    if (error) {
      // Fallback: for existing users, try magiclink which works regardless of signup status
      console.warn('⚠️ Signup link generation failed, attempting magiclink fallback...', error.message);
      const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo },
      });
      if (!magicError) {
        const magicLink = magicData?.properties?.action_link || magicData?.action_link || magicData?.email_otp_link;
        if (magicLink) {
          console.log('ℹ️ Using magiclink fallback for existing user.');
          return magicLink;
        }
      }
      const sep = redirectTo.includes('?') ? '&' : '?';
      console.error('❌ Failed to generate Supabase action link:', error.message, magicError ? ` | magiclink error: ${magicError.message}` : '');
      return `${redirectTo}${sep}email=${encodeURIComponent(email)}&note=generate_link_error`;
    }
    const link = data?.properties?.action_link || data?.action_link || data?.email_otp_link;
    if (!link) {
      const sep = redirectTo.includes('?') ? '&' : '?';
      console.warn('⚠️ No action_link returned; falling back to placeholder.');
      return `${redirectTo}${sep}email=${encodeURIComponent(email)}&note=no_action_link`;
    }
    return link;
  } catch (e) {
    const sep = redirectTo.includes('?') ? '&' : '?';
    console.error('❌ Exception when generating action link:', e);
    return `${redirectTo}${sep}email=${encodeURIComponent(email)}&note=exception_action_link`;
  }
}

function buildHtml(confirmLink) {
  const logoPath = path.join(__dirname, 'user-frontend', 'public', 'Neatrix_logo_transparent_white.png');
  const hasLogo = fs.existsSync(logoPath);

  const buttonStyles = [
    'display:inline-block',
    'padding:12px 18px',
    'background:#0F766E',
    'color:#fff',
    'text-decoration:none',
    'border-radius:8px',
    'font-weight:600',
  ].join(';');

  const container = [
    'max-width:600px',
    'margin:0 auto',
    'background:#ffffff',
    'border-radius:12px',
    'box-shadow:0 4px 14px rgba(0,0,0,0.08)',
    'padding:24px',
    'font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
    'color:#0A0A0A',
  ].join(';');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirm your email</title>
</head>
<body style="background:#F5F7FA; padding:24px;">
  <div style="${container}">
    ${hasLogo ? '<div style="text-align:center; margin-bottom:16px;"><img src="cid:neatrix-logo" alt="Neatrix Logo" style="height:48px;" /></div>' : ''}
    <h1 style="margin:0 0 8px; font-size:22px;">Confirm your email</h1>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6;">Welcome to Neatrix Professional Cleaning Services. Please confirm your email to finish creating your account.</p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${confirmLink}" style="${buttonStyles}">Confirm Email</a>
    </div>
    <p style="font-size:13px; color:#4B5563;">If the button doesn’t work, copy and paste this URL into your browser:</p>
    <p style="font-size:13px; word-break:break-all; color:#111827;">${confirmLink}</p>
    <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0" />
    <p style="font-size:12px; color:#6B7280;">If you didn’t request this, you can ignore this email.</p>
  </div>
</body>
</html>`;
}

async function createTransport() {
  if (useEthereal) {
    const account = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: account.user, pass: account.pass },
    });
    return { transporter, mode: 'ethereal', account };
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return { transporter, mode: 'smtp' };
}

async function main() {
  const emailArg = process.argv[2] || 'helptrendingnotice@gmail.com';
  const redirectArg = process.argv[3] || 'http://localhost:5175/email-verification-success';

  console.log('📧 Target recipient:', emailArg);
  console.log('🔗 Redirect URL:', redirectArg);
  if (!SUPABASE_URL) console.warn('⚠️ SUPABASE_URL missing — set in .env.local or export it.');
  if (!SERVICE_ROLE_KEY) console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY missing — cannot generate real action link.');

  const confirmLink = await generateConfirmationLink(emailArg, redirectArg);
  const html = buildHtml(confirmLink);

  const { transporter, mode } = await createTransport();

  const logoPath = path.join(__dirname, 'user-frontend', 'public', 'Neatrix_logo_transparent_white.png');
  const attachments = fs.existsSync(logoPath)
    ? [{ filename: 'Neatrix-logo.png', path: logoPath, cid: 'neatrix-logo' }]
    : [];

  const fromHeader = `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL || 'no-reply@neatrix.example'}>`;

  console.log('✉️  Sending email via', mode === 'ethereal' ? 'Ethereal (test)' : `${SMTP_HOST}:${SMTP_PORT}`);

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to: emailArg,
      subject: 'Confirm your Neatrix account',
      html,
      attachments,
    });

    console.log('✅ Email sent. Message ID:', info.messageId);
    if (mode === 'ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('🔎 Preview URL (Ethereal):', previewUrl);
    }
    console.log('🔗 Confirmation link used:', confirmLink);
  } catch (e) {
    console.error('❌ Failed to send email:', e);
    process.exit(1);
  }
}

main();