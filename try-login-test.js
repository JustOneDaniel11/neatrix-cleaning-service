#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const email = process.argv[2];
const password = process.argv[3] || 'TestPassword123!';

(async () => {
  if (!email) {
    console.error('Usage: node try-login-test.js <email> [password]');
    process.exit(1);
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log('❌ Sign-in error:', error.message);
    process.exit(0);
  }
  console.log('✅ Signed in:', data.user?.id);
})();