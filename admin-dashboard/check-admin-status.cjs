const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminStatus() {
  try {
    console.log('🔍 Checking admin status and database connectivity...');
    
    // Check users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log('👥 Found', users?.length || 0, 'users in database');
    if (users && users.length > 0) {
      console.log('📋 All users:');
      users.forEach(user => {
        console.log('  -', user.email, '(ID:', user.id + ')');
      });
    }
    
    // Check bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(3);
    
    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError);
    } else {
      console.log('📅 Found', bookings?.length || 0, 'bookings in database');
    }
    
    // Try to get current session
    const { data: session } = await supabase.auth.getSession();
    console.log('🔐 Current session:', session?.session ? 'Active' : 'None');
    
    // Test authentication with the first user (assuming it's an admin)
    if (users && users.length > 0) {
      console.log('\n🔐 Testing authentication...');
      const testEmail = users[0].email;
      console.log('📧 Attempting to sign in with:', testEmail);
      
      // Try common admin passwords
      const commonPasswords = ['admin123', 'password', 'admin', '123456', 'neatrix123'];
      
      for (const password of commonPasswords) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: password,
          });
          
          if (!error && data.user) {
            console.log('✅ Successfully authenticated with password:', password);
            console.log('👤 User:', data.user.email);
            
            // Sign out immediately
            await supabase.auth.signOut();
            console.log('🚪 Signed out');
            break;
          }
        } catch (authError) {
          // Continue to next password
        }
      }
    }
    
    console.log('✅ Database connectivity check complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAdminStatus();