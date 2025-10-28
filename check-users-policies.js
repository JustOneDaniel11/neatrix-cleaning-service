const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersPolicies() {
  console.log('🔍 Testing different update query variations...\n');

  try {
    // First authenticate as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authenticated as admin');

    // Get a user to test with
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .limit(1);

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError.message);
      return;
    }

    if (users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }

    const testUser = users[0];
    console.log(`📝 Testing update on user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`   Original name: ${testUser.full_name}`);

    // Test 1: Update without select
    console.log('\n🧪 Test 1: Update without select...');
    const { data: updateData1, error: updateError1 } = await supabase
      .from('users')
      .update({ full_name: 'Test Update 1' })
      .eq('id', testUser.id);

    if (updateError1) {
      console.error('❌ Update failed:', updateError1.message);
    } else {
      console.log('✅ Update successful (no select)');
      console.log('   Data returned:', updateData1);
    }

    // Test 2: Update with select (no single)
    console.log('\n🧪 Test 2: Update with select (no single)...');
    const { data: updateData2, error: updateError2 } = await supabase
      .from('users')
      .update({ full_name: 'Test Update 2' })
      .eq('id', testUser.id)
      .select();

    if (updateError2) {
      console.error('❌ Update failed:', updateError2.message);
    } else {
      console.log('✅ Update successful (with select)');
      console.log('   Data returned:', updateData2);
      console.log('   Data length:', updateData2?.length);
    }

    // Test 3: Update with select and single
    console.log('\n🧪 Test 3: Update with select and single...');
    const { data: updateData3, error: updateError3 } = await supabase
      .from('users')
      .update({ full_name: 'Test Update 3' })
      .eq('id', testUser.id)
      .select()
      .single();

    if (updateError3) {
      console.error('❌ Update failed:', updateError3.message);
      console.error('   Error details:', updateError3);
    } else {
      console.log('✅ Update successful (with select and single)');
      console.log('   Data returned:', updateData3);
    }

    // Test 4: Check if we can read the user after update
    console.log('\n🧪 Test 4: Reading user after update...');
    const { data: readData, error: readError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', testUser.id)
      .single();

    if (readError) {
      console.error('❌ Read failed:', readError.message);
    } else {
      console.log('✅ Read successful');
      console.log('   Current data:', readData);
    }

    // Restore original name
    console.log('\n🔄 Restoring original name...');
    await supabase
      .from('users')
      .update({ full_name: testUser.full_name })
      .eq('id', testUser.id);
    console.log('✅ Original name restored');

    // Sign out
    await supabase.auth.signOut();
    console.log('\n🚪 Signed out');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUsersPolicies().catch(console.error);