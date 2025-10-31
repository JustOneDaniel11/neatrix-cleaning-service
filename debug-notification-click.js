const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugNotificationClick() {
  console.log('🔍 Debugging Notification Click Issues...\n');

  try {
    // 1. Check if we have any notifications with booking IDs
    console.log('1. Checking notifications with booking IDs...');
    const { data: notifications, error: notifError } = await supabase
      .from('admin_notifications')
      .select('*')
      .not('action_label', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
      return;
    }

    console.log(`✅ Found ${notifications.length} notifications with action_label:`);
    notifications.forEach(notif => {
      console.log(`  - ID: ${notif.id}, Type: ${notif.type}, Action Label: ${notif.action_label}, Status: ${notif.status}`);
    });

    if (notifications.length === 0) {
      console.log('⚠️  No notifications with action_label found. Creating test notification...');
      
      // Get a booking ID first
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);

      if (bookingError || !bookings.length) {
        console.error('❌ Error fetching bookings:', bookingError);
        return;
      }

      const bookingId = bookings[0].id;
      
      // Create test notification
      const { data: newNotif, error: createError } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'booking',
          priority: 'low',
          title: 'Test Notification',
          message: 'Test notification for debugging',
          action_label: `booking_id:${bookingId}`,
          status: 'unread'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating test notification:', createError);
        return;
      }

      console.log(`✅ Created test notification: ${newNotif.id}`);
      notifications.push(newNotif);
    }

    // 2. Test marking notification as read
    if (notifications.length > 0) {
      const testNotif = notifications[0];
      console.log(`\n2. Testing mark as read for notification: ${testNotif.id}`);
      
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ status: 'read' })
        .eq('id', testNotif.id);

      if (updateError) {
        console.error('❌ Error marking notification as read:', updateError);
      } else {
        console.log('✅ Successfully marked notification as read');
      }
    }

    // 3. Check if booking exists for the action_label
    const testNotif = notifications[0];
    if (testNotif && testNotif.action_label && testNotif.action_label.startsWith('booking_id:')) {
      const bookingId = testNotif.action_label.replace('booking_id:', '');
      console.log(`\n3. Checking if booking exists: ${bookingId}`);
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        console.error('❌ Error fetching booking:', bookingError);
      } else {
        console.log('✅ Booking found:', {
          id: booking.id,
          service_type: booking.service_type,
          status: booking.status
        });
      }
    }

    console.log('\n🎯 Summary of Issues to Check in Frontend:');
    console.log('1. Ensure handleNotificationClick is being called');
    console.log('2. Check if notification.type includes "booking"');
    console.log('3. Verify action_label extraction logic');
    console.log('4. Confirm booking lookup in state.bookings');
    console.log('5. Check modal state setters (setSelectedBooking, setShowBookingModal)');
    console.log('6. Verify navigation logic (setActiveTab, navigate)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugNotificationClick();