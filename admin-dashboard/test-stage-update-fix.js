import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStageUpdateFix() {
  try {
    console.log('🧪 Testing the fixed stage update functionality...');
    
    // Get the first order
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, stage_timestamps, updated_at')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No orders found');
      return;
    }
    
    const testOrder = orders[0];
    console.log('📋 Testing with order:', testOrder.id.slice(-6));
    console.log('📋 Current tracking_stage:', testOrder.tracking_stage);
    console.log('📋 Current stage_timestamps:', testOrder.stage_timestamps);
    
    // Simulate the fixed updateTrackingStage logic
    const newStage = testOrder.tracking_stage === 'sorting' ? 'washing' : 'sorting';
    const now = new Date().toISOString();
    const currentTimestamps = testOrder.stage_timestamps || {};
    const updatedTimestamps = {
      ...currentTimestamps,
      [newStage]: now
    };
    
    console.log(`\n🔄 Updating stage from "${testOrder.tracking_stage}" to "${newStage}"...`);
    
    // Step 1: Attempt update (this will likely return empty array due to RLS)
    const { data, error } = await supabase
      .from('bookings')
      .update({
        tracking_stage: newStage,
        updated_at: now,
        stage_timestamps: updatedTimestamps
      })
      .eq('id', testOrder.id)
      .select();
    
    if (error) {
      console.error('❌ Update error:', error);
      return;
    }
    
    console.log('📊 Update response data:', data);
    console.log('📊 Data length:', data?.length || 0);
    
    // Step 2: Handle the RLS policy behavior (empty array response)
    if (!data || data.length === 0) {
      console.log('ℹ️ Update returned no data (RLS policy), verifying...');
      
      // Verify the update was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('bookings')
        .select('id, tracking_stage, stage_timestamps, updated_at')
        .eq('id', testOrder.id)
        .single();
      
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
        return;
      }
      
      console.log('📋 Verification result:');
      console.log('  - Stage updated:', verifyData.tracking_stage === newStage ? '✅' : '❌');
      console.log('  - New stage:', verifyData.tracking_stage);
      console.log('  - Timestamps updated:', verifyData.stage_timestamps[newStage] ? '✅' : '❌');
      console.log('  - Updated at changed:', verifyData.updated_at !== testOrder.updated_at ? '✅' : '❌');
      
      if (verifyData.tracking_stage === newStage) {
        console.log('\n🎉 SUCCESS: Stage update fix is working correctly!');
        console.log('🔧 The function now properly handles RLS policy behavior');
      } else {
        console.log('\n❌ FAILED: Stage was not updated');
      }
    } else {
      console.log('✅ Update returned data directly (RLS allows it)');
      console.log('📋 Updated data:', data[0]);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStageUpdateFix();