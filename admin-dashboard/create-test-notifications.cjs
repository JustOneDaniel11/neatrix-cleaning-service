const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestNotifications() {
  console.log('🧪 Creating Test Notifications for Enhanced System...\n');

  try {
    // Create different types of test notifications
    const notifications = [
      {
        title: 'New Customer Review',
        message: 'Customer Sarah Johnson submitted a 5-star review for Deep Cleaning service',
        type: 'booking', // Using valid type
        priority: 'low',
        action_url: '/admin/reviews',
        action_label: 'View Review'
      },
      {
        title: 'Support Ticket Update',
        message: 'New message received in support ticket #ST789',
        type: 'support',
        priority: 'high', // high is valid
        action_url: '/admin/support',
        action_label: 'View Ticket'
      },
      {
        title: 'Contact Form Submission',
        message: 'New contact form submission from Mike Davis regarding pricing',
        type: 'contact',
        priority: 'low',
        action_url: '/admin/contact',
        action_label: 'View Message'
      },
      {
        title: 'System Maintenance Alert',
        message: 'Scheduled maintenance window tonight from 2-4 AM EST',
        type: 'system',
        priority: 'normal', // Using valid priority
        action_url: '/admin/settings',
        action_label: 'View Details'
      },
      {
        title: 'New Booking Received',
        message: 'New house cleaning booking from Emma Wilson for next Tuesday',
        type: 'booking',
        priority: 'normal', // Using valid priority
        action_url: '/admin/bookings',
        action_label: 'View Booking'
      }
    ];

    for (const notification of notifications) {
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([{
          ...notification,
          status: 'unread'
        }])
        .select();
      
      if (error) {
        console.error('❌ Error creating notification:', error);
      } else {
        console.log(`✅ Created ${notification.type} notification: ${notification.title}`);
      }
    }
    
    console.log('\n🎉 Test notifications created successfully!');
    console.log('Check the admin dashboard notifications page to see the enhanced display.');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestNotifications();