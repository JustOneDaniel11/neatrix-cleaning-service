const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsersTable() {
  try {
    console.log('Checking public.users table...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      console.log('Users in public.users table:', users);
    }

    // Also check auth.uid() after authentication
    console.log('\nAuthenticating as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('Authenticated user ID:', authData.user.id);

    // Check if this user exists in public.users
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id);

    if (publicUserError) {
      console.error('Error checking public user:', publicUserError);
    } else {
      console.log('Admin user in public.users:', publicUser);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkUsersTable();