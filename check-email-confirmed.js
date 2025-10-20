#!/usr/bin/env node
'use strict';

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const email = process.argv[2] || process.env.TARGET_EMAIL;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email) {
    console.error('Usage: node check-email-confirmed.js <email>');
    process.exit(1);
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) {
      console.error('Error listing users:', error.message);
      process.exit(1);
    }

    const match = data.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!match) {
      console.log('User not found for:', email);
      process.exit(0);
    }

    const out = {
      id: match.id,
      email: match.email,
      email_confirmed_at: match.email_confirmed_at,
      created_at: match.created_at,
      updated_at: match.updated_at,
      app_metadata: match.app_metadata,
      user_metadata: match.user_metadata,
    };
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
}

main();