// Update existing booking to stain_removing stage for testing
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateBookingStage() {
  console.log('Updating booking to stain_removing stage...');
  
  const bookingId = '6659180c-1a16-4ef2-92db-af2f939d14ff';
  
  try {
    // Update the booking to stain_removing stage
    const { data, error } = await supabase
      .from('bookings')
      .update({
        tracking_stage: 'stain_removing',
        stage_timestamps: {
          sorting: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          stain_removing: new Date().toISOString() // now
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();

    if (error) {
      console.error('Error updating booking:', error);
      return;
    }

    console.log('Booking updated successfully:', data);
    
    // Verify the update
    const { data: updatedBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, service_name, tracking_stage, pickup_option, stage_timestamps, status')
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated booking:', fetchError);
    } else {
      console.log('Updated booking:', updatedBooking);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

updateBookingStage();