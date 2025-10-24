#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load env from admin-dashboard/.env if present
const envPath = path.join(__dirname, '..', 'admin-dashboard', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Fallbacks if .env not present
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'contactneatrix@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'RelaxwithDan_11_123456@JustYou';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function ensureAuth(email, password) {
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log('Sign-in failed:', error.message);
    // Try sign up for non-admin test users
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) {
      throw new Error(`Auth failed for ${email}: ${signUpErr.message}`);
    }
    const res = await supabase.auth.signInWithPassword({ email, password });
    data = res.data;
  }
  return data.user;
}

async function main() {
  try {
    const user = await ensureAuth(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    if (!user) throw new Error('No user after auth');

    const payment = {
      user_id: user.id,
      amount: 5000.00,
      currency: 'NGN',
      payment_method: 'card',
      payment_gateway: 'paystack',
      transaction_reference: `ref_${Date.now()}`,
      gateway_reference: 'AUTH_test_code',
      status: 'success',
      description: 'Test payment via seed script',
      metadata: {
        channel: 'card',
        email: TEST_USER_EMAIL,
        card: { last4: '4242', brand: 'visa', exp_month: 12, exp_year: 2027 }
      }
    };

    const { data, error } = await supabase.from('payments').insert(payment).select('*').single();
    if (error) {
      console.error('Insert payment failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Inserted payment:', data);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();