import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugRLS() {
  console.log('🔍 Debugging RLS policies...');
  
  try {
    // First, let's check what user we're authenticated as
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Current user:', user ? user.id : 'Anonymous');
    
    // Get an order to test with
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, user_id')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No orders found');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Testing with order:', {
      id: order.id.slice(-6),
      current_stage: order.tracking_stage,
      user_id: order.user_id
    });
    
    // Try a simple update without any conditions
    console.log('\n🔄 Attempting simple update...');
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({ tracking_stage: 'washing' })
      .eq('id', order.id);
    
    console.log('📊 Update result:', {
      data: updateData,
      error: updateError
    });
    
    // Check if the update actually happened
    console.log('\n🔍 Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bookings')
      .select('tracking_stage')
      .eq('id', order.id)
      .single();
    
    console.log('📋 Verification result:', {
      data: verifyData,
      error: verifyError
    });
    
    // Try with .select() to see if that helps
    console.log('\n🔄 Attempting update with .select()...');
    const { data: updateWithSelectData, error: updateWithSelectError } = await supabase
      .from('bookings')
      .update({ tracking_stage: 'sorting' })
      .eq('id', order.id)
      .select();
    
    console.log('📊 Update with select result:', {
      data: updateWithSelectData,
      error: updateWithSelectError
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugRLS();