// This script mimics the exact update operation from the browser
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im' +
  'hya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.' +
  'SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrowserUpdate() {
  try {
    console.log('🔍 Fetching orders to test update...');
    
    // Get the first order
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('�� No orders found');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Testing with order:', {
      id: order.id.slice(-6),
      currentStage: order.tracking_stage,
      pickupOption: order.pickup_option
    });
    
    // Test 1: Simple update (just tracking_stage)
    console.log('\n🧪 Test 1: Simple update (tracking_stage only)');
    const now = new Date().toISOString();
    const simpleUpdateData = {
      tracking_stage: order.tracking_stage, // Same value
      updated_at: now
    };
    
    const { data: simpleResult, error: simpleError } = await supabase
      .from('bookings')
      .update(simpleUpdateData)
      .eq('id', order.id)
      .select();
    
    if (simpleError) {
      console.error('❌ Simple update failed:', simpleError);
    } else {
      console.log('✅ Simple update successful');
    }
    
    // Test 2: Update with stage_timestamps
    console.log('\n🧪 Test 2: Update with stage_timestamps');
    const currentTimestamps = order.stage_timestamps || {};
    const updatedTimestamps = {
      ...currentTimestamps,
      [order.tracking_stage]: now
    };
    
    const fullUpdateData = {
      tracking_stage: order.tracking_stage,
      stage_timestamps: updatedTimestamps,
      updated_at: now
    };
    
    console.log('�� Update data:', fullUpdateData);
    
    const { data: fullResult, error: fullError } = await supabase
      .from('bookings')
      .update(fullUpdateData)
      .eq('id', order.id)
      .select();
    
    if (fullError) {
      console.error('❌ Full update failed:', fullError);
      console.error('Error details:', {
        message: fullError.message,
        details: fullError.details,
        hint: fullError.hint,
        code: fullError.code
      });
    } else {
      console.log('✅ Full update successful');
      console.log('Result:', fullResult);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBrowserUpdate();
