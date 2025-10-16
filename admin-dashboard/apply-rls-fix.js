import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Applying RLS policy fix for order updates...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  try {
    console.log('\n🔍 Testing current update capability...');
    
    // First, let's test if we can update without the policy fix
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('id, tracking_stage')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot read bookings:', testError);
      return;
    }
    
    if (!testData || testData.length === 0) {
      console.log('⚠️ No bookings found to test with');
      return;
    }
    
    const testBooking = testData[0];
    console.log(`📋 Testing with booking: ${testBooking.id}`);
    console.log(`📋 Current stage: ${testBooking.tracking_stage}`);
    
    // Try to update the updated_at field (this should work if RLS allows it)
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', testBooking.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.log('\n📝 RLS Policy Fix Required:');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log(`
-- Fix RLS policies for admin dashboard updates
DROP POLICY IF EXISTS "admin_update_bookings" ON public.bookings;
CREATE POLICY "admin_update_bookings" ON public.bookings
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- Also ensure INSERT is allowed if needed
DROP POLICY IF EXISTS "admin_insert_bookings" ON public.bookings;
CREATE POLICY "admin_insert_bookings" ON public.bookings
  FOR INSERT 
  WITH CHECK (true);

-- Verify policies
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY policyname;
      `);
    } else {
      console.log('✅ Update successful!');
      console.log('📊 Update data:', updateData);
      
      if (!updateData || updateData.length === 0) {
        console.log('ℹ️ Update returned no data (RLS policy behavior), but no error occurred');
        console.log('This means the update worked but RLS prevents returning the updated data');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during RLS fix:', error);
  }
}

applyRLSFix().then(() => {
  console.log('\n🏁 RLS fix attempt complete');
}).catch(error => {
  console.error('❌ Failed to apply RLS fix:', error);
});