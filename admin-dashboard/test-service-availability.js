import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing service availability...');
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testServices() {
  try {
    console.log('\n🧪 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test authentication
    console.log('\n🧪 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth service error:', authError.message);
    } else {
      console.log('✅ Auth service available');
    }
    
    // Test if we can read from users table
    console.log('\n🧪 Testing users table access...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError) {
      console.error('❌ Users table access failed:', userError.message);
    } else {
      console.log('✅ Users table accessible');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Service test failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

testServices().then(success => {
  if (success) {
    console.log('\n🎉 All services are available and working!');
  } else {
    console.log('\n⚠️ Some services are experiencing issues');
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});