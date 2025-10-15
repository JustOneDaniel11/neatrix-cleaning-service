// Create a test booking for debugging stage progression
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExistingBookings() {
  console.log('Checking existing bookings...');
  
  try {
    // Check all bookings first
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('id, service_type, service_name, tracking_stage, pickup_option, stage_timestamps, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allError) {
      console.error('Error fetching all bookings:', allError);
    } else {
      console.log('All bookings:', allBookings);
    }
    
    // Check dry cleaning bookings specifically
    const { data: dryCleaningBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, service_name, tracking_stage, pickup_option, stage_timestamps, status')
      .or('service_type.eq.dry_cleaning,service_name.ilike.%dry%')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching dry cleaning bookings:', fetchError);
    } else {
      console.log('Dry cleaning bookings:', dryCleaningBookings);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkExistingBookings();