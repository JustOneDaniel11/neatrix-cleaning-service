const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminNotifications() {
  console.log('🧪 Testing Admin Notifications After RLS Fix...\n');

  try {
    // 1. Test reading existing notifications
    console.log('1. Testing notification reading:');
    const { data: notifications, error: readError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (readError) {
      console.error('❌ Error reading notifications:', readError);
    } else {
      console.log(`✅ Successfully read ${notifications.length} notifications`);
      if (notifications.length > 0) {
        console.log('Latest notification:', notifications[0].title);
      }
    }

    // 2. Test creating a new notification
    console.log('\n2. Testing notification creation:');
    const { data: newNotification, error: createError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Test Notification',
        message: 'This is a test notification created after RLS policy fix',
        type: 'system',
        priority: 'normal',
        action_url: '/admin/test',
        action_label: 'Test Action'
      })
      .select();

    if (createError) {
      console.error('❌ Error creating notification:', createError);
    } else {
      console.log('✅ Successfully created notification:', newNotification[0].id);
    }

    // 3. Test updating a notification
    if (newNotification && newNotification[0]) {
      console.log('\n3. Testing notification update:');
      const { data: updatedNotification, error: updateError } = await supabase
        .from('admin_notifications')
        .update({ status: 'read' })
        .eq('id', newNotification[0].id)
        .select();

      if (updateError) {
        console.error('❌ Error updating notification:', updateError);
      } else {
        console.log('✅ Successfully updated notification status');
      }
    }

    // 4. Test other admin operations
    console.log('\n4. Testing other admin data access:');
    
    // Test bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, created_at')
      .limit(5);

    if (bookingsError) {
      console.error('❌ Error reading bookings:', bookingsError);
    } else {
      console.log(`✅ Successfully read ${bookings.length} bookings`);
    }

    // Test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(5);

    if (usersError) {
      console.error('❌ Error reading users:', usersError);
    } else {
      console.log(`✅ Successfully read ${users.length} users`);
    }

    // Test contact messages
    const { data: messages, error: messagesError } = await supabase
      .from('contact_messages')
      .select('id, name, created_at')
      .limit(5);

    if (messagesError) {
      console.error('❌ Error reading contact messages:', messagesError);
    } else {
      console.log(`✅ Successfully read ${messages.length} contact messages`);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAdminNotifications().then(() => {
  console.log('\n🎉 Admin notification testing complete!');
});