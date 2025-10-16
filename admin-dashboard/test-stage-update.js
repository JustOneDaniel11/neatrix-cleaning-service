import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStageUpdate() {
  try {
    console.log('🔍 Testing database connection and permissions...');
    
    // First, fetch existing orders
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, stage_timestamps, pickup_option')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('📭 No orders found to test with');
      return;
    }
    
    const testOrder = orders[0];
    console.log('📋 Testing with order:', {
      id: testOrder.id.slice(-6),
      currentStage: testOrder.tracking_stage,
      pickupOption: testOrder.pickup_option
    });
    
    // Test update without actually changing the stage (dry run)
    const now = new Date().toISOString();
    const updateData = {
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', testOrder.id)
      .select();
    
    if (error) {
      console.error('❌ Update test failed:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Update test successful');
      console.log('Updated data:', data);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStageUpdate();
