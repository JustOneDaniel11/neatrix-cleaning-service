const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function authenticateAdmin() {
  try {
    console.log('Attempting to sign in as admin...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    });

    if (error) {
      console.error('Authentication error:', error);
      return;
    }

    console.log('Authentication successful!');
    console.log('User:', data.user);
    console.log('Session:', data.session);

    // Now try to update a booking
    console.log('\nTrying to update booking stage...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        tracking_stage: 'stain_removing',
        stage_timestamps: {
          sorting: new Date().toISOString(),
          stain_removing: new Date().toISOString()
        }
      })
      .eq('id', '6659180c-1a16-4ef2-92db-af2f939d14ff')
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Update successful:', updateData);
    }

    // Check the booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', '6659180c-1a16-4ef2-92db-af2f939d14ff')
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    } else {
      console.log('Current booking state:', booking);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

authenticateAdmin();