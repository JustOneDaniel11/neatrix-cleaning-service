const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFunctionUpdate() {
  try {
    console.log('Authenticating as admin...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    });

    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }

    console.log('Authentication successful!');

    // Get current booking state
    console.log('\nFetching current booking state...');
    const { data: beforeBooking, error: beforeError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', '6659180c-1a16-4ef2-92db-af2f939d14ff')
      .single();

    if (beforeError) {
      console.error('Error fetching booking:', beforeError);
      return;
    }

    console.log('Before update:', {
      tracking_stage: beforeBooking.tracking_stage,
      stage_timestamps: beforeBooking.stage_timestamps,
      tracking_history: beforeBooking.tracking_history
    });

    // Use the update_tracking_stage function
    console.log('\nCalling update_tracking_stage function...');
    const { data: functionResult, error: functionError } = await supabase
      .rpc('update_tracking_stage', {
        booking_id: '6659180c-1a16-4ef2-92db-af2f939d14ff',
        new_stage: 'stain_removing',
        admin_notes: 'Stage updated via admin dashboard test'
      });

    if (functionError) {
      console.error('Function error:', functionError);
    } else {
      console.log('Function call successful:', functionResult);
    }

    // Get updated booking state
    console.log('\nFetching updated booking state...');
    const { data: afterBooking, error: afterError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', '6659180c-1a16-4ef2-92db-af2f939d14ff')
      .single();

    if (afterError) {
      console.error('Error fetching updated booking:', afterError);
    } else {
      console.log('After update:', {
        tracking_stage: afterBooking.tracking_stage,
        stage_timestamps: afterBooking.stage_timestamps,
        tracking_history: afterBooking.tracking_history
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testFunctionUpdate();