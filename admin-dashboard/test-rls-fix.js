import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing RLS policy fix for order updates...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define tracking stage progression
const trackingStages = {
  'pending': 'confirmed',
  'confirmed': 'pickup_scheduled', 
  'pickup_scheduled': 'picked_up',
  'picked_up': 'sorting',
  'sorting': 'stain_removing',
  'stain_removing': 'washing',
  'washing': 'drying',
  'drying': 'ironing',
  'ironing': 'quality_check',
  'quality_check': 'packaging',
  'packaging': 'ready_for_delivery',
  'ready_for_delivery': 'out_for_delivery',
  'out_for_delivery': 'delivered'
};

async function testRLSFix() {
  try {
    console.log('\n🔍 Step 1: Fetching test order...');
    
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, updated_at')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Failed to fetch orders:', fetchError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('⚠️ No orders found to test with');
      return;
    }
    
    const testOrder = orders[0];
    console.log('✅ Found test order:', {
      id: testOrder.id,
      current_stage: testOrder.tracking_stage,
      updated_at: testOrder.updated_at
    });
    
    console.log('\n🔄 Step 2: Testing order update...');
    
    // Try to update the order with a simple field change
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    const { data: updateResult, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', testOrder.id)
      .select('id, tracking_stage, updated_at');
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }
    
    console.log('📊 Update result:', updateResult);
    
    if (!updateResult || updateResult.length === 0) {
      console.log('⚠️ Update returned no data - checking if RLS policies are still blocking...');
      
      // Verify the order still exists
      const { data: verifyOrder } = await supabase
        .from('bookings')
        .select('id, tracking_stage, updated_at')
        .eq('id', testOrder.id);
      
      console.log('🔍 Order verification:', verifyOrder);
      
      if (verifyOrder && verifyOrder.length > 0) {
        const order = verifyOrder[0];
        const originalTime = new Date(testOrder.updated_at).getTime();
        const newTime = new Date(order.updated_at).getTime();
        
        if (newTime > originalTime) {
          console.log('✅ Update was successful! RLS policies are working correctly.');
          console.log('ℹ️ The empty update result is normal behavior with RLS policies.');
          console.log(`📅 Timestamp updated: ${testOrder.updated_at} → ${order.updated_at}`);
        } else {
          console.log('❌ Update was not applied. RLS policies may still be blocking updates.');
          console.log('💡 Please run the SQL fix in your Supabase dashboard:');
          console.log('   File: fix-order-update-rls.sql');
        }
      }
    } else {
      console.log('✅ Update successful with data returned!');
    }
    
    console.log('\n🔄 Step 3: Testing tracking stage update...');
    
    const currentStage = testOrder.tracking_stage;
    const nextStage = trackingStages[currentStage];
    
    if (!nextStage) {
      console.log(`ℹ️ Order is at final stage: ${currentStage}`);
      return;
    }
    
    console.log(`🎯 Testing stage update: ${currentStage} → ${nextStage}`);
    
    const stageUpdateData = {
      tracking_stage: nextStage,
      updated_at: new Date().toISOString(),
      [`${nextStage}_at`]: new Date().toISOString()
    };
    
    const { data: stageResult, error: stageError } = await supabase
      .from('bookings')
      .update(stageUpdateData)
      .eq('id', testOrder.id)
      .select('id, tracking_stage, updated_at');
    
    if (stageError) {
      console.error('❌ Stage update failed:', stageError);
      return;
    }
    
    console.log('📊 Stage update result:', stageResult);
    
    // Verify the stage update
    const { data: finalVerify } = await supabase
      .from('bookings')
      .select('id, tracking_stage, updated_at')
      .eq('id', testOrder.id);
    
    if (finalVerify && finalVerify.length > 0) {
      const finalOrder = finalVerify[0];
      if (finalOrder.tracking_stage === nextStage) {
        console.log('🎉 SUCCESS! Tracking stage update is working correctly!');
        console.log(`✅ Stage updated: ${currentStage} → ${finalOrder.tracking_stage}`);
      } else {
        console.log('❌ Stage update failed - stage not changed');
        console.log('💡 RLS policies may still need to be applied');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

testRLSFix().then(() => {
  console.log('\n🏁 RLS fix test complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});