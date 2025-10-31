const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBookingAndNotification() {
  console.log('🔍 Checking booking and notification data...\n');

  // 1. Check the notification
  const { data: notifications, error: notifError } = await supabase
    .from('admin_notifications')
    .select('*')
    .eq('action_label', 'booking_id:6659180c-1a16-4ef2-92db-af2f939d14ff');

  if (notifError) {
    console.error('❌ Error fetching notification:', notifError);
    return;
  }

  console.log('📋 Notification data:');
  console.log(notifications[0]);
  console.log('');

  // 2. Check if booking exists
  const bookingId = '6659180c-1a16-4ef2-92db-af2f939d14ff';
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError) {
    console.error('❌ Error fetching booking:', bookingError);
  } else {
    console.log('✅ Booking exists:');
    console.log(`ID: ${booking.id}`);
    console.log(`Service Type: ${booking.service_type}`);
    console.log(`Status: ${booking.status}`);
    console.log(`Created: ${booking.created_at}`);
    console.log('');
  }

  // 3. Check all bookings to see what's available
  const { data: allBookings, error: allBookingsError } = await supabase
    .from('bookings')
    .select('id, service_type, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (allBookingsError) {
    console.error('❌ Error fetching all bookings:', allBookingsError);
  } else {
    console.log('📊 Recent bookings in database:');
    allBookings.forEach((b, index) => {
      console.log(`${index + 1}. ID: ${b.id}, Type: ${b.service_type}, Status: ${b.status}`);
    });
  }
}

checkBookingAndNotification().catch(console.error);