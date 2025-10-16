import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdatePermissions() {
  try {
    console.log('🔍 Testing update permissions...');
    
    // Get the first order
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, updated_at')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }
    
    const testOrder = orders[0];
    console.log('📋 Testing with order:', testOrder.id.slice(-6));
    console.log('📋 Original updated_at:', testOrder.updated_at);
    
    // Test 1: Simple field update
    console.log('\n🧪 Test 1: Simple updated_at field...');
    const now1 = new Date().toISOString();
    const { data: result1, error: error1 } = await supabase
      .from('bookings')
      .update({ updated_at: now1 })
      .eq('id', testOrder.id);
    
    console.log('Result 1:', { data: result1, error: error1 });
    
    // Verify
    const { data: verify1 } = await supabase
      .from('bookings')
      .select('updated_at')
      .eq('id', testOrder.id)
      .single();
    console.log('Verification 1 - updated_at changed:', verify1.updated_at !== testOrder.updated_at);
    
    // Test 2: tracking_stage update
    console.log('\n🧪 Test 2: tracking_stage field...');
    const originalStage = testOrder.tracking_stage;
    const newStage = originalStage === 'sorting' ? 'washing' : 'sorting';
    
    const { data: result2, error: error2 } = await supabase
      .from('bookings')
      .update({ tracking_stage: newStage })
      .eq('id', testOrder.id);
    
    console.log('Result 2:', { data: result2, error: error2 });
    
    // Verify
    const { data: verify2 } = await supabase
      .from('bookings')
      .select('tracking_stage')
      .eq('id', testOrder.id)
      .single();
    console.log('Verification 2 - stage changed:', verify2.tracking_stage !== originalStage);
    console.log('New stage:', verify2.tracking_stage);
    
    // Test 3: stage_timestamps update
    console.log('\n🧪 Test 3: stage_timestamps field...');
    const { data: result3, error: error3 } = await supabase
      .from('bookings')
      .update({ 
        stage_timestamps: { [newStage]: new Date().toISOString() }
      })
      .eq('id', testOrder.id);
    
    console.log('Result 3:', { data: result3, error: error3 });
    
    // Verify
    const { data: verify3 } = await supabase
      .from('bookings')
      .select('stage_timestamps')
      .eq('id', testOrder.id)
      .single();
    console.log('Verification 3 - timestamps updated:', verify3.stage_timestamps);
    
    // Reset to original state
    console.log('\n🔄 Resetting to original state...');
    await supabase
      .from('bookings')
      .update({ 
        tracking_stage: originalStage,
        stage_timestamps: {}
      })
      .eq('id', testOrder.id);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUpdatePermissions();