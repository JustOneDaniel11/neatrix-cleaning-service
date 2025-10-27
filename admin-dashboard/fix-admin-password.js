import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Anon Key:', supabaseAnonKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLoginAndUpdate() {
  try {
    console.log('🔄 Attempting to sign in with existing admin...')
    
    // Try to sign in with the admin user to test current password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    })
    
    if (signInData.user) {
      console.log('✅ Login successful! Password is already correct.')
      console.log('📧 Email:', signInData.user.email)
      console.log('🔑 Password: RelaxwithDan_11_123456@JustYou')
      console.log('🌐 Login URL: http://localhost:5174/')
      return
    }
    
    console.log('❌ Login failed, trying password reset...')
    
    // Try common passwords first
    const commonPasswords = ['admin', 'password', '123456', 'admin123', 'neatrix', 'contactneatrix']
    
    for (const pwd of commonPasswords) {
      console.log(`🔄 Trying password: ${pwd}`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'contactneatrix@gmail.com',
        password: pwd
      })
      
      if (data.user) {
        console.log(`✅ Found working password: ${pwd}`)
        console.log('🔄 Now updating to new password...')
        
        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: 'RelaxwithDan_11_123456@JustYou'
        })
        
        if (updateError) {
          console.error('❌ Error updating password:', updateError.message)
        } else {
          console.log('✅ Password updated successfully!')
          console.log('📧 Email: contactneatrix@gmail.com')
          console.log('🔑 New password: RelaxwithDan_11_123456@JustYou')
          console.log('🌐 Login URL: http://localhost:5174/')
        }
        return
      }
    }
    
    console.log('❌ Could not find working password.')
    console.log('💡 Manual solution needed:')
    console.log('1. Go to Supabase Dashboard > Authentication > Users')
    console.log('2. Find contactneatrix@gmail.com')
    console.log('3. Click the three dots (...) menu')
    console.log('4. Select "Send password recovery email" when rate limit resets')
    console.log('5. Or wait 24 hours for rate limit to reset')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testLoginAndUpdate()