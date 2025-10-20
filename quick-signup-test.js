#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

(async () => {
  console.log('🚀 Quick Signup Test with valid domain');
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing env values');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const testEmail = `test.${Date.now()}@mailinator.com`;
  const testPassword = 'TestPassword123!';
  console.log('📧 Email:', testEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: 'Signup Test' },
      emailRedirectTo: `${process.env.VITE_SITE_URL || 'http://localhost:5173'}/email-verification-success`
    }
  });

  if (error) {
    console.log('❌ Signup failed:', error.message);
    console.log('   Status:', error.status || 'N/A');
    process.exit(0);
  }

  console.log('✅ Signup successful.');
  console.log('   User ID:', data.user?.id);
  console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
})();