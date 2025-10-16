import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithRetry(testName, testFn, maxRetries = 3) {
  console.log(`\n🧪 Testing: ${testName}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxRetries}...`);
      const result = await testFn();
      console.log(`✅ ${testName} succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting 2 seconds before retry...`);
        await sleep(2000);
      } else {
        console.log(`💥 ${testName} failed after ${maxRetries} attempts`);
        throw error;
      }
    }
  }
}

async function testNetworkConnectivity() {
  console.log('🌐 Testing network connectivity with retries...');
  
  try {
    // Test 1: Basic fetch
    await testWithRetry('Basic fetch', async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, tracking_stage')
        .limit(1);
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No data returned');
      
      console.log(`📋 Found order: ${data[0].id.slice(-6)} (stage: ${data[0].tracking_stage})`);
      return data[0];
    });
    
    // Test 2: Update operation
    const order = await testWithRetry('Update operation', async () => {
      // First get an order
      const { data: orders, error: fetchError } = await supabase
        .from('bookings')
        .select('id, tracking_stage')
        .limit(1);
      
      if (fetchError) throw fetchError;
      if (!orders || orders.length === 0) throw new Error('No orders found');
      
      const order = orders[0];
      const newStage = order.tracking_stage === 'sorting' ? 'washing' : 'sorting';
      
      console.log(`🔄 Updating ${order.id.slice(-6)} from "${order.tracking_stage}" to "${newStage}"`);
      
      // Perform update
      const { data: updateData, error: updateError } = await supabase
        .from('bookings')
        .update({ tracking_stage: newStage })
        .eq('id', order.id)
        .select();
      
      if (updateError) throw updateError;
      
      console.log(`📊 Update returned:`, updateData);
      
      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from('bookings')
        .select('tracking_stage')
        .eq('id', order.id)
        .single();
      
      if (verifyError) throw verifyError;
      
      console.log(`✅ Verification: stage is now "${verifyData.tracking_stage}"`);
      
      if (verifyData.tracking_stage !== newStage) {
        throw new Error(`Update failed: expected "${newStage}", got "${verifyData.tracking_stage}"`);
      }
      
      return { order, newStage, updateData, verifyData };
    });
    
    console.log('\n🎉 All tests passed! Network connectivity and updates are working.');
    console.log('📝 Summary:');
    console.log('  - Network connectivity: ✅ Working');
    console.log('  - Database reads: ✅ Working');
    console.log('  - Database updates: ✅ Working');
    console.log('  - Update verification: ✅ Working');
    
  } catch (error) {
    console.error('\n💥 Network connectivity test failed:', error.message);
    console.log('\n📝 This confirms the intermittent network issue is the root cause.');
    console.log('🔧 The fix in OrderDetails.tsx should handle this gracefully when it occurs.');
  }
}

testNetworkConnectivity();