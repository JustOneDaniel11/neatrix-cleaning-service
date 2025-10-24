import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBookingConstraint() {
  try {
    console.log('Checking booking constraint and current data...');
    
    // Get sample booking data to see current status values
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, service_type, pickup_option')
      .limit(10);
      
    if (bookingError) {
      console.error('Error fetching bookings:', bookingError);
      return;
    }
    
    console.log('Current booking statuses:');
    bookings.forEach(booking => {
      console.log(`- ID: ${booking.id}, Status: ${booking.status}, Service: ${booking.service_type}, Pickup: ${booking.pickup_option}`);
    });
    
    // Get unique status values
    const uniqueStatuses = [...new Set(bookings.map(b => b.status))];
    console.log('\nUnique status values in database:', uniqueStatuses);
    
    // Test what happens when we try to update with 'approved'
    console.log('\nTesting status update with "approved"...');
    const testBookingId = bookings[0]?.id;
    
    if (testBookingId) {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'approved' })
        .eq('id', testBookingId)
        .select();
        
      if (error) {
        console.log('Error with "approved" status:', error.message);
        
        // Try other status values
        const testStatuses = ['confirmed', 'in_progress', 'completed', 'picked_up', 'dropped_off'];
        
        for (const status of testStatuses) {
          console.log(`Testing status: ${status}`);
          const { error: testError } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', testBookingId)
            .select();
            
          if (testError) {
            console.log(`  ❌ ${status}: ${testError.message}`);
          } else {
            console.log(`  ✅ ${status}: Valid`);
            // Revert back to original status
            await supabase
              .from('bookings')
              .update({ status: bookings[0].status })
              .eq('id', testBookingId);
          }
        }
      } else {
        console.log('✅ "approved" status works fine');
        // Revert back
        await supabase
          .from('bookings')
          .update({ status: bookings[0].status })
          .eq('id', testBookingId);
      }
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkBookingConstraint();