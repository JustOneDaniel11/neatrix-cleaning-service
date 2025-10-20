#!/usr/bin/env node
'use strict';

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Prefer .env.local at project root
const envLocalPath = path.join(__dirname, '.env.local');
const envPathToUse = fs.existsSync(envLocalPath) ? envLocalPath : path.join(__dirname, '.env');

dotenv.config({ path: envPathToUse });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing Supabase URL or anon key in', envPathToUse);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function main() {
  const emailArg = process.argv[2] || 'helptrendingnotice@gmail.com';
  const redirectArg = process.argv[3] || 'http://localhost:5175/email-verification-success';
  const password = 'TestPassword123!';

  console.log('🧪 Sending signup to:', emailArg);
  console.log('🔗 Redirect URL:', redirectArg);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: emailArg,
      password,
      options: {
        emailRedirectTo: redirectArg,
      },
    });

    if (error) {
      console.error('❌ Signup error:', error.message);
      if (error.status === 429) {
        console.error('⏰ Rate limit hit — email system is working; wait and retry.');
      }
      process.exit(1);
    }

    console.log('✅ Signup initiated. Check inbox for confirmation email.');
    console.log('User:', JSON.stringify(data.user, null, 2));
  } catch (e) {
    console.error('❌ Unexpected error:', e);
    process.exit(1);
  }
}

main();