import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateNotifications() {
  try {
    // First, get all notifications that might be laundry-related but have wrong action_url
    const { data: notifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('action_url', '/admin/orders')
      .in('type', ['booking', 'laundry']);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return;
    }

    console.log(`Found ${notifications.length} notifications to potentially update`);

    for (const notification of notifications) {
      // Check if this notification is for a laundry order by looking at the message
      const isLaundryNotification = 
        notification.message.includes('dry_cleaning') || 
        notification.message.includes('Dry Cleaning') ||
        notification.message.includes('laundry') ||
        notification.message.includes('Laundry') ||
        notification.title.includes('Laundry');

      if (isLaundryNotification) {
        console.log(`Updating notification ${notification.id}: ${notification.title}`);
        
        const { error: updateError } = await supabase
          .from('admin_notifications')
          .update({ 
            action_url: '/admin/laundry'
          })
          .eq('id', notification.id);

        if (updateError) {
          console.error(`Error updating notification ${notification.id}:`, updateError);
        } else {
          console.log(`Successfully updated notification ${notification.id}`);
        }
      }
    }

    console.log('Notification update completed');
  } catch (error) {
    console.error('Script error:', error);
  }
}

updateNotifications();