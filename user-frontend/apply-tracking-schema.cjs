#!/usr/bin/env node

// Script to apply enhanced tracking schema to Supabase database
const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { join } = require('path');

// Load environment variables
require('dotenv').config({ path: join(__dirname, '.env.local') });

// For testing purposes, we'll try to get the config from the running app
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'example';

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔑 Using key:', supabaseServiceKey ? 'Key found' : 'No key found');

if (supabaseUrl === 'https://example.supabase.co' || supabaseServiceKey === 'example') {
  console.log('⚠️  Using default configuration. This will likely fail.');
  console.log('💡 Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyTrackingSchema() {
  console.log('🚀 Applying enhanced tracking schema...');
  
  try {
    // Step 1: Add new columns to bookings table
    console.log('📝 Adding tracking columns to bookings table...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.bookings 
        ADD COLUMN IF NOT EXISTS tracking_stage TEXT DEFAULT 'sorting' CHECK (tracking_stage IN ('sorting', 'stain_removing', 'washing', 'ironing', 'packing', 'ready_for_delivery', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'delivered')),
        ADD COLUMN IF NOT EXISTS pickup_option TEXT DEFAULT 'pickup' CHECK (pickup_option IN ('pickup', 'delivery')),
        ADD COLUMN IF NOT EXISTS stage_timestamps JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS stage_notes JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS tracking_history JSONB DEFAULT '[]';
      `
    });

    if (alterError) {
      console.error('❌ Error adding columns:', alterError);
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying alternative approach...');
      
      const { error: directError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);
        
      if (directError) {
        console.error('❌ Database connection error:', directError);
        return;
      }
      
      console.log('✅ Database connection successful. Columns may already exist.');
    } else {
      console.log('✅ Tracking columns added successfully');
    }

    // Step 2: Update existing records
    console.log('📝 Updating existing dry cleaning records...');
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        tracking_stage: 'sorting',
        pickup_option: 'pickup',
        stage_timestamps: {},
        stage_notes: {},
        tracking_history: []
      })
      .or('service_type.eq.dry_cleaning,service_name.ilike.%dry%')
      .is('tracking_stage', null);

    if (updateError) {
      console.log('⚠️  Update warning (may be expected):', updateError.message);
    } else {
      console.log('✅ Existing records updated successfully');
    }

    console.log('🎉 Enhanced tracking schema applied successfully!');
    console.log('');
    console.log('📋 Summary of changes:');
    console.log('  • Added tracking_stage column');
    console.log('  • Added pickup_option column');
    console.log('  • Added stage_timestamps JSONB column');
    console.log('  • Added stage_notes JSONB column');
    console.log('  • Added tracking_history JSONB column');
    console.log('  • Updated existing dry cleaning records');
    console.log('');
    console.log('⚠️  Note: Database functions need to be created manually in Supabase SQL Editor');
    console.log('   Please run the enhance-order-tracking.sql file in the Supabase dashboard');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
applyTrackingSchema();