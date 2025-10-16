import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
  try {
    console.log('🔍 Testing RLS policies and permissions...');
    
    // Get the first order
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, updated_at')
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
    console.log('📋 Testing with order:', testOrder.id);
    console.log('📋 Current tracking_stage:', testOrder.tracking_stage);
    
    // Test 1: Update without .select()
    console.log('\n🧪 Test 1: Update without .select()...');
    const { data: updateData1, error: updateError1 } = await supabase
      .from('bookings')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id);
    
    console.log('Result 1:', { data: updateData1, error: updateError1 });
    
    // Test 2: Update with .select()
    console.log('\n🧪 Test 2: Update with .select()...');
    const { data: updateData2, error: updateError2 } = await supabase
      .from('bookings')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select();
    
    console.log('Result 2:', { data: updateData2, error: updateError2 });
    
    // Test 3: Update with specific select fields
    console.log('\n🧪 Test 3: Update with specific select fields...');
    const { data: updateData3, error: updateError3 } = await supabase
      .from('bookings')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select('id, tracking_stage, updated_at');
    
    console.log('Result 3:', { data: updateData3, error: updateError3 });
    
    // Test 4: Check if we can read after update
    console.log('\n🧪 Test 4: Verify record after update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, updated_at')
      .eq('id', testOrder.id);
    
    console.log('Verify result:', { data: verifyData, error: verifyError });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRLSPolicies();