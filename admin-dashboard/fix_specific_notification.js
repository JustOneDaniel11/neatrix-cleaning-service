import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNotification() {
  try {
    const notificationId = 'd9b37053-27c7-48d2-a74c-7728d479748c';
    
    console.log(`Updating notification ${notificationId}...`);
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .update({ action_url: '/admin/laundry' })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Error updating notification:', error);
    } else {
      console.log('Successfully updated notification:', data);
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixNotification();