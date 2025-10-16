import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Fixing RLS policies for order updates...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('\n🔍 Step 1: Checking current RLS policies...');
    
    // Check if we can read policies (this might fail with anon key)
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'bookings' })
      .catch(() => ({ data: null, error: 'Cannot read policies with anon key' }));

    if (policyError) {
      console.log('⚠️ Cannot read policies with anon key (expected)');
    }

    console.log('\n🔍 Step 2: Testing update with service role key...');
    
    // We need to use service role key for admin operations
    // Let's check if there's a service role key in the environment
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.log('⚠️ No service role key found. Creating RLS policy fix...');
      
      // Create SQL to fix RLS policies
      const rlsFixSQL = `
-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access" ON bookings;
DROP POLICY IF EXISTS "Allow anonymous update access" ON bookings;
DROP POLICY IF EXISTS "Allow admin full access" ON bookings;

-- Create permissive policies for admin dashboard
CREATE POLICY "Allow anonymous read access" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous update access" ON bookings
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous insert access" ON bookings
  FOR INSERT WITH CHECK (true);

-- Alternative: Create a more specific policy for tracking stage updates
CREATE POLICY "Allow tracking stage updates" ON bookings
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
`;

      console.log('\n📝 RLS Policy Fix SQL:');
      console.log(rlsFixSQL);
      console.log('\n⚠️ Please run this SQL in your Supabase dashboard SQL editor to fix the RLS policies.');
      
      return;
    }

    // If we have service role key, try to fix policies programmatically
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log('✅ Service role key found, attempting to fix policies...');
    
    // Test update with service role
    const { data: orders } = await adminSupabase
      .from('bookings')
      .select('id, tracking_stage')
      .limit(1);
    
    if (orders && orders.length > 0) {
      const testOrder = orders[0];
      const { data: updateResult, error: updateError } = await adminSupabase
        .from('bookings')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testOrder.id)
        .select();
      
      if (updateError) {
        console.error('❌ Even service role update failed:', updateError);
      } else {
        console.log('✅ Service role update successful');
        console.log('🔧 The issue is with RLS policies for anonymous users');
      }
    }

  } catch (error) {
    console.error('❌ Error checking RLS policies:', error);
  }
}

// Also create a simple policy fix that can be applied
const createPolicyFix = () => {
  console.log('\n🔧 Quick RLS Policy Fix:');
  console.log('Run this in your Supabase SQL editor:');
  console.log(`
-- Temporarily allow all operations for development
DROP POLICY IF EXISTS "temp_allow_all" ON bookings;
CREATE POLICY "temp_allow_all" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- Or more specific for admin operations
DROP POLICY IF EXISTS "admin_update_bookings" ON bookings;
CREATE POLICY "admin_update_bookings" ON bookings 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);
`);
};

fixRLSPolicies().then(() => {
  createPolicyFix();
  console.log('\n🏁 RLS policy check complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 RLS fix script failed:', error);
  createPolicyFix();
  process.exit(1);
});