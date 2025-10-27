import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Testing Admin Credentials')
console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Anon Key:', supabaseAnonKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminCredentials() {
  const adminEmail = 'contactneatrix@gmail.com'
  const adminPassword = 'RelaxwithDan_11_123456@JustYou'
  
  console.log('\n🔍 Testing Admin Credentials:')
  console.log('📧 Email:', adminEmail)
  console.log('🔑 Password:', adminPassword)
  
  try {
    console.log('\n🔄 Attempting sign in...')
    
    // Test with timeout to match the frontend behavior
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
    );
    
    const authPromise = supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    
    const { data, error } = await Promise.race([authPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Authentication Error:', error.message)
      console.error('📋 Full Error:', error)
      
      // Try to get more details about the user
      console.log('\n🔍 Checking if user exists in auth.users...')
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('email, email_confirmed_at, banned_until, deleted_at')
        .eq('email', adminEmail)
        .single()
      
      if (userError) {
        console.log('❌ Could not check user existence:', userError.message)
      } else {
        console.log('✅ User found in database:', userData)
      }
      
      return false
    }
    
    if (!data?.user) {
      console.error('❌ No user data returned')
      return false
    }
    
    console.log('✅ Authentication successful!')
    console.log('👤 User ID:', data.user.id)
    console.log('📧 Email:', data.user.email)
    console.log('✅ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
    console.log('🔐 Session:', data.session ? 'Active' : 'None')
    
    // Test if user can access admin resources
    console.log('\n🔍 Testing admin permissions...')
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1)
    
    if (bookingsError) {
      console.log('❌ Cannot access bookings:', bookingsError.message)
    } else {
      console.log('✅ Can access bookings table')
    }
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('admin_notifications')
      .select('id')
      .limit(1)
    
    if (notificationsError) {
      console.log('❌ Cannot access admin_notifications:', notificationsError.message)
    } else {
      console.log('✅ Can access admin_notifications table')
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    console.error('📋 Full error:', err)
    return false
  }
}

async function testAlternativePasswords() {
  const adminEmail = 'contactneatrix@gmail.com'
  const commonPasswords = [
    'admin',
    'password', 
    '123456',
    'admin123',
    'neatrix',
    'contactneatrix',
    'RelaxwithDan_11_123456@JustYou'
  ]
  
  console.log('\n🔄 Testing common passwords...')
  
  for (const password of commonPasswords) {
    try {
      console.log(`🔍 Trying: ${password}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password,
      })
      
      if (data?.user && !error) {
        console.log(`✅ SUCCESS! Working password: ${password}`)
        return password
      }
      
    } catch (err) {
      console.log(`❌ Failed: ${password}`)
    }
  }
  
  console.log('❌ No working password found')
  return null
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Admin Credential Tests\n')
  
  const success = await testAdminCredentials()
  
  if (!success) {
    console.log('\n🔄 Primary credentials failed, testing alternatives...')
    const workingPassword = await testAlternativePasswords()
    
    if (workingPassword) {
      console.log(`\n✅ Found working credentials:`)
      console.log(`📧 Email: contactneatrix@gmail.com`)
      console.log(`🔑 Password: ${workingPassword}`)
    } else {
      console.log('\n❌ No working credentials found. Admin user may need to be created.')
    }
  }
  
  console.log('\n🏁 Test completed')
}

runAllTests()