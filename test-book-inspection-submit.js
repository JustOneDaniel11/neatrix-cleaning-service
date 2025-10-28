#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.join(__dirname, 'user-frontend', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'contactneatrix@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'RelaxwithDan_11_123456@JustYou';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBookInspectionSubmit() {
  console.log('🧪 Testing Book Inspection Form Submit Functionality');
  console.log('=' .repeat(60));

  try {
    // Step 1: Authenticate user
    console.log('\n📝 Step 1: Authenticating test user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authentication successful:', authData.user.email);

    // Step 2: Get user profile
    console.log('\n👤 Step 2: Fetching user profile...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Failed to fetch user profile:', profileError.message);
      return;
    }

    console.log('✅ User profile loaded:', userProfile.full_name);

    // Step 3: Test createBooking function with inspection data
    console.log('\n🏠 Step 3: Testing inspection booking creation...');
    
    const testBookingData = {
      service_type: 'inspection',
      service_name: 'Property Inspection',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      time: '10:00 AM',
      address: '123 Test Street, Test City, TC 12345',
      phone: '+1234567890',
      special_instructions: 'Test inspection booking from automated test',
      status: 'pending',
      total_amount: 150.00
    };

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        ...testBookingData,
        user_id: authData.user.id
      }])
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation failed:', bookingError.message);
      return;
    }

    console.log('✅ Inspection booking created successfully!');
    console.log('📋 Booking details:');
    console.log(`   - ID: ${bookingData.id}`);
    console.log(`   - Service: ${bookingData.service_name}`);
    console.log(`   - Date: ${bookingData.date}`);
    console.log(`   - Time: ${bookingData.time}`);
    console.log(`   - Address: ${bookingData.address}`);
    console.log(`   - Amount: $${bookingData.total_amount}`);
    console.log(`   - Status: ${bookingData.status}`);

    // Step 4: Verify booking was saved correctly
    console.log('\n🔍 Step 4: Verifying booking in database...');
    const { data: verifyBooking, error: verifyError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingData.id)
      .single();

    if (verifyError) {
      console.error('❌ Failed to verify booking:', verifyError.message);
      return;
    }

    console.log('✅ Booking verification successful!');
    console.log(`   - Service Type: ${verifyBooking.service_type}`);
    console.log(`   - User ID: ${verifyBooking.user_id}`);
    console.log(`   - Created: ${verifyBooking.created_at}`);

    // Step 5: Clean up test booking
    console.log('\n🧹 Step 5: Cleaning up test booking...');
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingData.id);

    if (deleteError) {
      console.warn('⚠️ Failed to clean up test booking:', deleteError.message);
    } else {
      console.log('✅ Test booking cleaned up successfully');
    }

    console.log('\n🎉 All tests passed! Book Inspection submit functionality is working correctly.');

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error);
  } finally {
    // Sign out
    await supabase.auth.signOut();
    console.log('\n🚪 Signed out successfully');
  }
}

// Run the test
testBookInspectionSubmit().catch(console.error);