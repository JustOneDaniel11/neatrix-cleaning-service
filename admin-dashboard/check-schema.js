import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking bookings table schema...');
    
    // Get a sample booking to see the current structure
    const { data: sample, error: sampleError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error fetching sample:', sampleError);
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('📋 Sample booking structure:');
      console.log('Fields:', Object.keys(sample[0]));
      console.log('stage_timestamps type:', typeof sample[0].stage_timestamps);
      console.log('stage_timestamps value:', sample[0].stage_timestamps);
      console.log('tracking_stage:', sample[0].tracking_stage);
      console.log('pickup_option:', sample[0].pickup_option);
    }
    
    // Test a simple update with just tracking_stage
    console.log('\n🧪 Testing simple stage update...');
    const testOrder = sample[0];
    const { data: updateResult, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        tracking_stage: testOrder.tracking_stage, // Same value, just testing update
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select();
    
    if (updateError) {
      console.error('❌ Simple update failed:', updateError);
    } else {
      console.log('✅ Simple update successful');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSchema();
