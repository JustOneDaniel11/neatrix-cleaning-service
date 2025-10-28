import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotification() {
  try {
    const { data: notifications, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Recent notifications:');
    notifications.forEach((notification, index) => {
      console.log(`\n${index + 1}. ID: ${notification.id}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Action URL: ${notification.action_url}`);
      console.log(`   Created: ${notification.created_at}`);
      
      // Check if this would be identified as laundry
      const isLaundryNotification = 
        notification.message.includes('dry_cleaning') || 
        notification.message.includes('laundry') ||
        notification.title.includes('Laundry');
      
      console.log(`   Would be updated: ${isLaundryNotification}`);
    });
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkNotification();