import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Applying RLS policy fix directly...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSDirectly() {
  try {
    console.log('\n🔍 Step 1: Checking current policies...');
    
    // Try to execute SQL to fix RLS policies
    const rlsFixSQL = `
      -- Drop existing restrictive policies
      DROP POLICY IF EXISTS "admin_update_bookings" ON public.bookings;
      DROP POLICY IF EXISTS "admin_insert_bookings" ON public.bookings;
      DROP POLICY IF EXISTS "allow_all_operations" ON public.bookings;
      
      -- Create permissive policies for all operations
      CREATE POLICY "allow_all_operations" ON public.bookings
        FOR ALL
        USING (true)
        WITH CHECK (true);
    `;
    
    console.log('\n🔧 Attempting to execute RLS fix SQL...');
    
    // Try using rpc to execute SQL (this might not work with anon key)
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: rlsFixSQL });
      if (error) {
        console.log('⚠️ Cannot execute SQL with anon key (expected):', error.message);
      } else {
        console.log('✅ SQL executed successfully:', data);
      }
    } catch (err) {
      console.log('⚠️ RPC method not available or insufficient permissions');
    }
    
    console.log('\n🧪 Step 2: Testing update after potential fix...');
    
    // Test if we can now update
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('id, tracking_stage')
      .limit(1);
    
    if (testError || !testData || testData.length === 0) {
      console.error('❌ Cannot read test data:', testError);
      return;
    }
    
    const testBooking = testData[0];
    const originalStage = testBooking.tracking_stage;
    const newStage = originalStage === 'sorting' ? 'washing' : 'sorting';
    
    console.log(`📋 Testing update: ${originalStage} → ${newStage}`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        tracking_stage: newStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', testBooking.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update still failing:', updateError);
      console.log('\n📝 Manual RLS Fix Required:');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log(`
-- Fix RLS policies for admin dashboard
DROP POLICY IF EXISTS "allow_all_operations" ON public.bookings;
CREATE POLICY "allow_all_operations" ON public.bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the policy was created
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY policyname;
      `);
    } else {
      console.log('✅ Update successful!');
      console.log('📊 Update result:', updateData);
      
      // Verify the update worked
      const { data: verifyData, error: verifyError } = await supabase
        .from('bookings')
        .select('id, tracking_stage')
        .eq('id', testBooking.id)
        .single();
      
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
      } else {
        console.log('📋 Verification result:');
        console.log(`  - Original stage: ${originalStage}`);
        console.log(`  - New stage: ${verifyData.tracking_stage}`);
        console.log(`  - Update successful: ${verifyData.tracking_stage === newStage ? '✅' : '❌'}`);
        
        // Revert the change for testing
        if (verifyData.tracking_stage === newStage) {
          await supabase
            .from('bookings')
            .update({ tracking_stage: originalStage })
            .eq('id', testBooking.id);
          console.log('🔄 Reverted test change');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error during RLS fix:', error);
  }
}

fixRLSDirectly().then(() => {
  console.log('\n🏁 RLS fix attempt complete');
}).catch(error => {
  console.error('❌ Failed to apply RLS fix:', error);
});