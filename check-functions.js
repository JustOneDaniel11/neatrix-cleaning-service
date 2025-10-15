const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFunctions() {
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

    // Try to call a simple function to see what's available
    console.log('\nTrying to call get_tracking_progress function...');
    const { data: progressResult, error: progressError } = await supabase
      .rpc('get_tracking_progress', {
        booking_id: '6659180c-1a16-4ef2-92db-af2f939d14ff'
      });

    if (progressError) {
      console.error('get_tracking_progress error:', progressError);
    } else {
      console.log('get_tracking_progress result:', progressResult);
    }

    // Try a different approach - check if we can use raw SQL
    console.log('\nTrying raw SQL query...');
    const { data: sqlResult, error: sqlError } = await supabase
      .from('bookings')
      .select('tracking_stage, stage_timestamps, tracking_history')
      .eq('id', '6659180c-1a16-4ef2-92db-af2f939d14ff');

    if (sqlError) {
      console.error('SQL error:', sqlError);
    } else {
      console.log('SQL result:', sqlResult);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkFunctions();