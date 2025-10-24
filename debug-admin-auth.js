const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAdminAuth() {
  console.log('🔍 Debugging Admin Authentication Context...\n');

  try {
    // 1. Check current session
    console.log('1. Checking current session:');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Current session:', session ? 'Active' : 'None');
      if (session) {
        console.log('User email:', session.user?.email);
        console.log('User ID:', session.user?.id);
      }
    }

    // 2. Check auth.users for admin
    console.log('\n2. Checking auth.users for admin:');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', 'contactneatrix@gmail.com');
    
    if (authError) {
      console.log('Cannot query auth.users directly (expected with anon key)');
    } else {
      console.log('Auth users found:', authUsers);
    }

    // 3. Check public.users for admin
    console.log('\n3. Checking public.users for admin:');
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'contactneatrix@gmail.com');
    
    if (publicError) {
      console.error('Error querying public.users:', publicError);
    } else {
      console.log('Public users found:', publicUsers);
    }

    // 4. Test auth.email() function
    console.log('\n4. Testing auth.email() function:');
    const { data: emailTest, error: emailError } = await supabase
      .rpc('get_current_user_email');
    
    if (emailError) {
      console.log('auth.email() test failed (function may not exist):', emailError.message);
    } else {
      console.log('Current auth.email():', emailTest);
    }

    // 5. Check RLS policies
    console.log('\n5. Checking current RLS policies for admin_notifications:');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'admin_notifications');
    
    if (policyError) {
      console.error('Error checking policies:', policyError);
    } else {
      console.log('Current policies:', policies);
    }

    // 6. Try to create a test notification (this should fail)
    console.log('\n6. Testing notification creation (should fail):');
    const { data: testNotification, error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Debug Test',
        message: 'Testing RLS policies',
        type: 'system',
        priority: 'normal'
      })
      .select();

    if (notificationError) {
      console.error('Expected error creating notification:', notificationError);
    } else {
      console.log('Unexpected success:', testNotification);
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Create a helper function to test if it exists
async function createEmailFunction() {
  console.log('\n7. Creating helper function for auth.email():');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION get_current_user_email()
    RETURNS TEXT
    LANGUAGE SQL
    SECURITY DEFINER
    AS $$
      SELECT auth.email();
    $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
  if (error) {
    console.error('Error creating function:', error);
  } else {
    console.log('Helper function created successfully');
  }
}

debugAdminAuth().then(() => {
  console.log('\n✅ Debug complete');
});