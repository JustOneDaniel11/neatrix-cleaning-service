#!/usr/bin/env node
'use strict';

// Generate a Supabase Auth action link (signup/magiclink/recovery/etc.)
// Usage:
//   export SUPABASE_URL="https://<project-ref>.supabase.co"
//   export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
//   node scripts/generate-action-link.js --email user@yourdomain.com \
//     --type signup \
//     --redirect http://localhost:5173/email-verification-success
//
// Notes:
// - Requires Service Role Key. DO NOT expose it to the frontend.
// - Prints the action link to stdout so you can open it directly.

const { createClient } = require('@supabase/supabase-js');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      out[key] = val;
    }
  }
  return out;
}

(async () => {
  const args = parseArgs();
  const email = args.email;
  const type = args.type || 'signup';
  const redirect = args.redirect || 'http://localhost:5173/email-verification-success';

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\nMissing env vars. Set both:');
    console.error('  SUPABASE_URL = https://<project-ref>.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY = <service-role-key>\n');
    process.exit(1);
  }

  if (!email) {
    console.error('\nMissing required --email argument.');
    console.error('Usage: node scripts/generate-action-link.js --email user@example.com [--type signup|magiclink|recovery|invite] [--redirect http://...]\n');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type,
      email,
      options: { redirectTo: redirect },
    });

    if (error) {
      console.error('Error generating link:', error);
      process.exit(1);
    }

    const actionLink = data?.properties?.action_link;
    console.log('\nAction Link:', actionLink || '(none returned)');
    console.log('\nFull response (for debugging):');
    console.log(JSON.stringify(data, null, 2));

    // Optional fallback: send an invite email if action_link is not returned
    if (!actionLink && type === 'signup') {
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirect,
      });
      console.log('\nInvite result:', JSON.stringify({ inviteData, inviteError }, null, 2));
    }
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
})();