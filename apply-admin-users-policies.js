const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: './admin-dashboard/.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Applying Admin Users Policies')
console.log('🔧 Supabase URL:', supabaseUrl)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function applyAdminUsersPolicies() {
  try {
    console.log('\n🔄 Authenticating as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    })

    if (authError) {
      console.error('❌ Authentication failed:', authError.message)
      return
    }

    console.log('✅ Admin authenticated successfully')

    const policies = [
      // Drop existing policies
      `DROP POLICY IF EXISTS "admin_read_users" ON public.users;`,
      `DROP POLICY IF EXISTS "admin_update_users" ON public.users;`,
      `DROP POLICY IF EXISTS "admin_delete_users" ON public.users;`,
      `DROP POLICY IF EXISTS "admin_full_access_users" ON public.users;`,
      
      // Create new comprehensive admin policies
      `CREATE POLICY "admin_read_users" ON public.users FOR SELECT USING (auth.email() = 'contactneatrix@gmail.com');`,
      `CREATE POLICY "admin_update_users" ON public.users FOR UPDATE USING (auth.email() = 'contactneatrix@gmail.com');`,
      `CREATE POLICY "admin_delete_users" ON public.users FOR DELETE USING (auth.email() = 'contactneatrix@gmail.com');`,
      `CREATE POLICY "admin_full_access_users" ON public.users FOR ALL USING (auth.email() = 'contactneatrix@gmail.com');`
    ]

    console.log('\n🔄 Applying admin users policies...')
    
    for (const [index, policy] of policies.entries()) {
      console.log(`📝 Executing policy ${index + 1}/${policies.length}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      
      if (error) {
        console.error(`❌ Failed to execute policy ${index + 1}:`, error.message)
        console.error('Policy:', policy)
      } else {
        console.log(`✅ Policy ${index + 1} executed successfully`)
      }
    }

    console.log('\n🔍 Verifying policies...')
    const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
            FROM pg_policies 
            WHERE tablename = 'users' AND policyname LIKE '%admin%';`
    })

    if (policiesError) {
      console.error('❌ Failed to verify policies:', policiesError.message)
    } else {
      console.log('✅ Current admin policies on users table:')
      console.log(policiesData)
    }

    console.log('\n🎉 Admin users policies applied successfully!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  } finally {
    await supabase.auth.signOut()
    console.log('🚪 Signed out')
  }
}

applyAdminUsersPolicies()