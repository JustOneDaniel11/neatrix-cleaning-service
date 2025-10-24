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
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) {
      throw new Error(`Auth failed for ${email}: ${signUpErr.message}`);
    }
    const res = await supabase.auth.signInWithPassword({ email, password });
    data = res.data;
  }
  return data.user;
}

async function ensureBooking(userId) {
  let { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !booking) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = '10:00:00';

    const { data: newBooking, error: createErr } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        status: 'confirmed',
        service_type: 'standard_clean',
        service_name: 'Standard Cleaning',
        date: dateStr,
        time: timeStr,
        address: '123 Test Street, Test City',
        phone: '+0000000000',
        total_amount: 5000,
      })
      .select('*')
      .single();
    if (createErr) throw new Error(`Create booking failed: ${createErr.message}`);
    booking = newBooking;
  }
  return booking;
}

async function main() {
  try {
    const user = await ensureAuth(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    if (!user) throw new Error('No user after auth');

    const booking = await ensureBooking(user.id);

    const review = {
      user_id: user.id,
      booking_id: booking.id,
      service_type: booking.service_type || 'standard_clean',
      rating: 5,
      title: 'Excellent Service',
      comment: 'Fantastic service! Clean, timely, and professional.',
    };

    const { data, error } = await supabase.from('reviews').insert(review).select('*').single();
    if (error) {
      console.error('Insert review failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Inserted review:', data);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();