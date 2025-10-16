import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debugging current "Order not found or not updated" issue...');
console.log('📊 Environment check:');
console.log('- Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCurrentIssue() {
  try {
    console.log('\n🔍 Step 1: Testing basic connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connectivity failed:', testError);
      return;
    }
    console.log('✅ Basic connectivity working');

    console.log('\n🔍 Step 2: Fetching recent orders...');
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        tracking_stage,
        pickup_option,
        total_amount,
        created_at,
        users (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (fetchError) {
      console.error('❌ Order fetch failed:', fetchError);
      return;
    }

    console.log(`✅ Found ${orders?.length || 0} orders`);
    
    if (orders && orders.length > 0) {
      const testOrder = orders[0];
      console.log('\n📋 Test order details:');
      console.log('- ID:', testOrder.id);
      console.log('- ID type:', typeof testOrder.id);
      console.log('- ID length:', testOrder.id?.length);
      console.log('- Current stage:', testOrder.tracking_stage);
      console.log('- Pickup option:', testOrder.pickup_option);
      console.log('- Customer:', testOrder.users?.full_name || 'Unknown');

      console.log('\n🔍 Step 3: Testing stage update...');
      
      // Get next stage
      const getNextStage = (currentStage, pickupOption) => {
        const pickupStages = ['sorting', 'stain_removing', 'washing', 'ironing', 'packing', 'ready_for_pickup', 'picked_up'];
        const deliveryStages = ['sorting', 'stain_removing', 'washing', 'ironing', 'packing', 'ready_for_delivery', 'out_for_delivery', 'delivered'];
        
        const stages = pickupOption === 'delivery' ? deliveryStages : pickupStages;
        const currentIndex = stages.indexOf(currentStage);
        return currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
      };

      const currentStage = testOrder.tracking_stage || 'sorting';
      const nextStage = getNextStage(currentStage, testOrder.pickup_option);
      
      if (!nextStage) {
        console.log('⚠️ Order is at final stage, cannot move to next');
        return;
      }

      console.log(`- Attempting to move from "${currentStage}" to "${nextStage}"`);

      const now = new Date().toISOString();
      const updateData = {
        tracking_stage: nextStage,
        updated_at: now,
        stage_timestamps: {
          [nextStage]: now
        }
      };

      console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

      const { data: updateResult, error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', testOrder.id)
        .select();

      if (updateError) {
        console.error('❌ Update failed:', updateError);
        console.error('- Error code:', updateError.code);
        console.error('- Error message:', updateError.message);
        console.error('- Error details:', updateError.details);
        console.error('- Error hint:', updateError.hint);
        return;
      }

      console.log('✅ Update result:', updateResult);
      
      if (!updateResult || updateResult.length === 0) {
        console.log('⚠️ Update returned no data (checking RLS policies...)');
        
        // Verify update by re-fetching
        const { data: verifyData, error: verifyError } = await supabase
          .from('bookings')
          .select('id, tracking_stage, updated_at')
          .eq('id', testOrder.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Verification failed:', verifyError);
        } else if (verifyData.tracking_stage === nextStage) {
          console.log('✅ Update verified successful via re-fetch');
        } else {
          console.log('❌ Update verification failed - stage not updated');
          console.log('- Expected stage:', nextStage);
          console.log('- Actual stage:', verifyData.tracking_stage);
        }
      } else {
        console.log('✅ Update successful with returned data');
      }

    } else {
      console.log('⚠️ No orders found to test with');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    if (error.message?.includes('fetch')) {
      console.error('🌐 This appears to be a network connectivity issue');
    }
  }
}

debugCurrentIssue().then(() => {
  console.log('\n🏁 Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});