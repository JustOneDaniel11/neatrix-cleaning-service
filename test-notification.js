const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './admin-dashboard/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestNotification() {
  try {
    // First, get a real booking ID
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, service_name, users(full_name)')
      .limit(1);
    
    if (bookingError || !bookings || bookings.length === 0) {
      console.error('Error fetching bookings:', bookingError);
      return;
    }
    
    const booking = bookings[0];
    console.log('Using booking:', booking);
    
    // Create a test notification with the booking ID
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Test Dry Cleaning Order',
        message: `Test notification for ${booking.users?.full_name || 'Customer'} - ${booking.service_name || 'Dry Cleaning'}`,
        type: 'booking',
        priority: 'low',
        action_url: '/admin/laundry',
        action_label: `booking_id:${booking.id}`,
        status: 'unread'
      })
      .select();
    
    if (error) {
      console.error('Error creating test notification:', error);
      return;
    }
    
    console.log('Test notification created successfully:', data);
  } catch (err) {
    console.error('Script error:', err);
  }
}

createTestNotification();