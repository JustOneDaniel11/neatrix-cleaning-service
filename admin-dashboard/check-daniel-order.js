import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ztjmxvdmkbhgqzjdvhqr.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0am14dmRta2JoZ3F6amR2aHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzU2NzQsImV4cCI6MjA1MDU1MTY3NH0.Zt8nLlnXo_b_LKqJdJOKjKJZ8KqJZ8KqJZ8KqI'
);

async function checkDanielOrder() {
  try {
    console.log('Checking bookings table structure...');
    
    // First, get a sample booking to see the structure
    const { data: sampleBookings, error: sampleError } = await supabase
      .from('bookings')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.error('Error fetching sample bookings:', sampleError);
      return;
    }
    
    if (sampleBookings && sampleBookings.length > 0) {
      console.log('Sample booking structure:');
      console.log(JSON.stringify(sampleBookings[0], null, 2));
      console.log('\nAvailable columns:', Object.keys(sampleBookings[0]));
    }
    
    // Check all bookings to find Daniel's order
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (allError) {
      console.error('Error fetching all bookings:', allError);
      return;
    }
    
    console.log('\nTotal recent bookings:', allBookings?.length || 0);
    
    // Look for Daniel's order by searching in various fields
    const danielBookings = allBookings?.filter(booking => {
      const searchText = 'danielayomidepaul@gmail.com';
      return (
        (booking.customer_email && booking.customer_email.includes(searchText)) ||
        (booking.email && booking.email.includes(searchText)) ||
        (booking.user_email && booking.user_email.includes(searchText)) ||
        (booking.customer_name && booking.customer_name.toLowerCase().includes('daniel')) ||
        (booking.name && booking.name.toLowerCase().includes('daniel')) ||
        JSON.stringify(booking).toLowerCase().includes('daniel')
      );
    });
    
    console.log('\nDaniel bookings found:', danielBookings?.length || 0);
    
    if (danielBookings && danielBookings.length > 0) {
      danielBookings.forEach((booking, index) => {
        console.log(`\nDaniel Booking ${index + 1}:`);
        console.log('Full booking:', JSON.stringify(booking, null, 2));
      });
    }
    
    // Check for laundry bookings specifically
    const laundryBookings = allBookings?.filter(booking => 
      booking.service_type === 'laundry' || 
      booking.service_type === 'dry_cleaning' ||
      (booking.service && (booking.service.includes('laundry') || booking.service.includes('dry')))
    );
    
    console.log('\nLaundry/Dry cleaning bookings found:', laundryBookings?.length || 0);
    
    if (laundryBookings && laundryBookings.length > 0) {
      for (const [index, booking] of laundryBookings.entries()) {
        console.log(`\nLaundry Booking ${index + 1}:`);
        console.log('Full booking data:', JSON.stringify(booking, null, 2));
        
        // Get user details for this booking
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', booking.user_id)
          .single();
        
        if (!userError && userData) {
          console.log('User details:', JSON.stringify(userData, null, 2));
        } else {
          console.log('User error or not found:', userError);
        }
      }
    }
    
    // Also check if there's a separate laundry_orders table
    console.log('\nChecking for laundry_orders table...');
    const { data: laundryOrders, error: laundryOrdersError } = await supabase
      .from('laundry_orders')
      .select('*')
      .limit(10);
    
    if (laundryOrdersError) {
      console.log('laundry_orders table error:', laundryOrdersError.message);
    } else {
      console.log('laundry_orders found:', laundryOrders?.length || 0);
      if (laundryOrders && laundryOrders.length > 0) {
        laundryOrders.forEach((order, index) => {
          console.log(`\nLaundry Order ${index + 1}:`, JSON.stringify(order, null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDanielOrder();