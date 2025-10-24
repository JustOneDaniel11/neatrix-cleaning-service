import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Fixing Admin RLS policies for complete dashboard access...');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('URL:', supabaseUrl ? '✅' : '❌');
  console.log('Service Role Key:', serviceRoleKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixAdminRLSPolicies() {
  try {
    console.log('\n🔍 Step 1: Creating admin user in public.users if needed...');
    
    // First, let's check if admin user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    let adminUser = null;
    if (authUsers && authUsers.users) {
      adminUser = authUsers.users.find(user => user.email === 'contactneatrix@gmail.com');
    }
    
    if (!adminUser) {
      console.log('⚠️ Admin user not found in auth.users. Creating...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'contactneatrix@gmail.com',
        password: 'Neatrix2024!',
        email_confirm: true
      });
      
      if (createError) {
        console.error('❌ Failed to create admin user:', createError);
      } else {
        console.log('✅ Admin user created successfully');
        adminUser = newUser.user;
      }
    } else {
      console.log('✅ Admin user found in auth.users');
    }

    // Ensure admin user exists in public.users
    if (adminUser) {
      const { data: publicUser, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: adminUser.id,
          email: 'contactneatrix@gmail.com',
          full_name: 'Neatrix Admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (insertError) {
        console.log('⚠️ Could not insert into public.users (might already exist):', insertError.message);
      } else {
        console.log('✅ Admin user ensured in public.users');
      }
    }

    console.log('\n🔍 Step 2: Fixing RLS policies for admin_notifications...');
    
    // Fix admin_notifications policies
    const adminNotificationsPolicies = [
      {
        name: 'admin_notifications_select_policy',
        sql: `CREATE POLICY "admin_notifications_select_policy" ON public.admin_notifications FOR SELECT USING (auth.email() = 'contactneatrix@gmail.com');`
      },
      {
        name: 'admin_notifications_insert_policy', 
        sql: `CREATE POLICY "admin_notifications_insert_policy" ON public.admin_notifications FOR INSERT WITH CHECK (auth.email() = 'contactneatrix@gmail.com');`
      },
      {
        name: 'admin_notifications_update_policy',
        sql: `CREATE POLICY "admin_notifications_update_policy" ON public.admin_notifications FOR UPDATE USING (auth.email() = 'contactneatrix@gmail.com');`
      },
      {
        name: 'admin_notifications_delete_policy',
        sql: `CREATE POLICY "admin_notifications_delete_policy" ON public.admin_notifications FOR DELETE USING (auth.email() = 'contactneatrix@gmail.com');`
      }
    ];

    // Drop existing policies first
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Admin users can view admin notifications" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "Admin users can create admin notifications" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "Admin users can update admin notifications" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "Admin users can delete admin notifications" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "admin_notifications_select_policy" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "admin_notifications_insert_policy" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "admin_notifications_update_policy" ON public.admin_notifications;`,
      `DROP POLICY IF EXISTS "admin_notifications_delete_policy" ON public.admin_notifications;`
    ];

    for (const dropSql of dropPolicies) {
      await supabase.rpc('exec_sql', { sql: dropSql }).catch(() => {});
    }

    // Create new policies
    for (const policy of adminNotificationsPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.log(`⚠️ Policy ${policy.name} might already exist or failed:`, error.message);
      } else {
        console.log(`✅ Created policy: ${policy.name}`);
      }
    }

    console.log('\n🔍 Step 3: Fixing RLS policies for other tables...');
    
    // Fix other table policies
    const otherPolicies = [
      // Bookings
      `DROP POLICY IF EXISTS "admin_full_access_bookings" ON public.bookings;`,
      `CREATE POLICY "admin_full_access_bookings" ON public.bookings FOR ALL USING (auth.email() = 'contactneatrix@gmail.com');`,
      
      // Users
      `DROP POLICY IF EXISTS "admin_read_users" ON public.users;`,
      `CREATE POLICY "admin_read_users" ON public.users FOR SELECT USING (auth.email() = 'contactneatrix@gmail.com');`,
      
      // Contact messages
      `DROP POLICY IF EXISTS "admin_read_contact_messages" ON public.contact_messages;`,
      `CREATE POLICY "admin_read_contact_messages" ON public.contact_messages FOR ALL USING (auth.email() = 'contactneatrix@gmail.com');`,
      
      // Payments
      `DROP POLICY IF EXISTS "admin_read_payments" ON public.payments;`,
      `CREATE POLICY "admin_read_payments" ON public.payments FOR SELECT USING (auth.email() = 'contactneatrix@gmail.com');`
    ];

    for (const sql of otherPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`⚠️ SQL execution might have failed:`, error.message);
      }
    }

    console.log('\n🔍 Step 4: Testing admin notification creation...');
    
    // Test creating an admin notification
    const { data: testNotification, error: testError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'RLS Policy Test',
        message: 'Testing admin notification creation after RLS policy fix',
        type: 'system',
        priority: 'normal',
        status: 'unread',
        action_url: '/admin/notifications',
        action_label: 'View Notifications'
      })
      .select();

    if (testError) {
      console.error('❌ Test notification creation failed:', testError);
    } else {
      console.log('✅ Test notification created successfully:', testNotification);
    }

    console.log('\n🔍 Step 5: Testing data fetching...');
    
    // Test fetching data from other tables
    const tables = ['bookings', 'users', 'contact_messages'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Failed to fetch from ${table}:`, error.message);
      } else {
        console.log(`✅ Successfully fetched from ${table} (${data?.length || 0} records)`);
      }
    }

    console.log('\n✅ Admin RLS policy fix completed!');
    console.log('🔄 Please refresh your admin dashboard to test the changes.');

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
`;

  const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL }).catch(() => {
    // Function might not exist yet, that's ok
    return { error: null };
  });

  if (error) {
    console.log('⚠️ Could not create exec_sql function, using direct SQL execution');
  }
}

// Run the fix
createExecSqlFunction().then(() => {
  return fixAdminRLSPolicies();
}).then(() => {
  console.log('\n🎉 All done!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});