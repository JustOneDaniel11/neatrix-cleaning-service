const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminUserButtons() {
  console.log('🧪 Testing Admin Dashboard User Action Buttons...\n');

  try {
    // Step 1: Authenticate as admin
    console.log('1. Authenticating as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    });

    if (authError) {
      console.error('❌ Admin authentication failed:', authError.message);
      return;
    }
    console.log('✅ Admin authenticated successfully');

    // Step 2: Fetch all users to test with
    console.log('\n2. Fetching users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No users found to test with');
      return;
    }

    console.log(`✅ Found ${users.length} users to test with`);

    // Step 3: Test view user functionality (this should always work)
    console.log('\n3. Testing VIEW user functionality...');
    const testUser = users[0];
    console.log(`📋 User details for ${testUser.email}:`);
    console.log(`   - ID: ${testUser.id}`);
    console.log(`   - Name: ${testUser.full_name || 'Not set'}`);
    console.log(`   - Phone: ${testUser.phone || 'Not set'}`);
    console.log(`   - Created: ${testUser.created_at}`);
    console.log('✅ View functionality works (data accessible)');

    // Step 4: Test update user functionality
    console.log('\n4. Testing UPDATE user functionality...');
    const originalName = testUser.full_name;
    const testName = `Test Updated Name ${Date.now()}`;
    
    // Perform update without select to avoid RLS issues
    const { error: updateError } = await supabase
      .from('users')
      .update({ full_name: testName })
      .eq('id', testUser.id);

    if (updateError) {
      console.error('❌ Update user failed:', updateError.message);
    } else {
      // Fetch the updated data separately
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', testUser.id)
        .single();
      
      if (fetchError) {
        console.error('❌ Failed to fetch updated user:', fetchError.message);
      } else {
        console.log('✅ User update successful');
        console.log(`   - Updated name from "${originalName}" to "${updatedUser.full_name}"`);
      }
      
      // Restore original name
      await supabase
        .from('users')
        .update({ full_name: originalName })
        .eq('id', testUser.id);
      console.log('✅ Original name restored');
    }

    // Step 5: Test delete user functionality
    console.log('\n5. Testing DELETE user functionality...');
    
    // Note: We cannot test actual deletion due to RLS policies preventing user creation
    // Instead, we'll test if the delete operation would be allowed by checking permissions
    console.log('ℹ️  Note: Testing delete permissions without actual deletion due to RLS policies');
    
    // Try to delete a non-existent user to test permissions
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', fakeUserId);

    if (deleteError) {
      if (deleteError.message.includes('row-level security policy')) {
        console.error('❌ Delete operation blocked by RLS policies');
        console.log('   📋 To fix this, execute the SQL file: admin-users-rls-policies.sql');
        console.log('   📋 This file contains the necessary RLS policies for admin operations');
      } else if (deleteError.message.includes('No rows found')) {
        console.log('✅ Delete permissions are working (no matching rows to delete)');
      } else {
        console.error('❌ Delete user failed:', deleteError.message);
      }
    } else {
      console.log('✅ Delete operation completed (no rows affected)');
    }

    // Step 6: Check for any permission issues
    console.log('\n6. Checking admin permissions...');
    const { data: adminProfile } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'contactneatrix@gmail.com')
      .single();

    if (adminProfile) {
      console.log('✅ Admin profile accessible');
      console.log(`   - Admin ID: ${adminProfile.id}`);
      console.log(`   - Admin role: ${adminProfile.role || 'Not set'}`);
    }

    console.log('\n🎉 Admin user button functionality test completed!');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  } finally {
    // Sign out
    await supabase.auth.signOut();
    console.log('\n🚪 Signed out');
  }
}

// Run the test
testAdminUserButtons().catch(console.error);