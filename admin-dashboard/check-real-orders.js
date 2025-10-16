import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealOrders() {
  try {
    console.log('🔍 Fetching all bookings from database...');
    
    // Fetch all bookings with user information
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching bookings:', error);
      return;
    }

    console.log(`📊 Total bookings found: ${bookings.length}`);
    
    if (bookings.length === 0) {
      console.log('📭 No bookings found in database');
      return;
    }

    // Check for orders from specific user
    const danielOrders = bookings.filter(booking => 
      booking.users?.email === 'danielayomidepaul@gmail.com'
    );
    
    console.log(`\n🎯 Orders from danielayomidepaul@gmail.com: ${danielOrders.length}`);
    
    // Display all orders with detailed tracking info
    console.log('\n📋 All Orders with Tracking Details:');
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Order #${booking.id.slice(-6).toUpperCase()}`);
      console.log(`   Service: ${booking.service_name}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Tracking Stage: ${booking.tracking_stage || 'Not set'}`);
      console.log(`   Pickup Option: ${booking.pickup_option || 'Not set'}`);
      console.log(`   Amount: $${booking.total_amount}`);
      console.log(`   Customer: ${booking.users?.full_name || 'N/A'}`);
      console.log(`   Email: ${booking.users?.email || 'N/A'}`);
      console.log(`   User ID: ${booking.user_id || 'Not set'}`);
      console.log(`   Has User Association: ${booking.users ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(booking.created_at).toLocaleDateString()}`);
      
      // Check if order can be moved to next stage
      const hasRequiredFields = booking.tracking_stage && booking.pickup_option && booking.user_id;
      console.log(`   ✅ Ready for stage updates: ${hasRequiredFields ? 'Yes' : 'No'}`);
      
      if (!hasRequiredFields) {
        const missing = [];
        if (!booking.tracking_stage) missing.push('tracking_stage');
        if (!booking.pickup_option) missing.push('pickup_option');
        if (!booking.user_id) missing.push('user_id');
        console.log(`   ❌ Missing fields: ${missing.join(', ')}`);
      }
    });

    // Check for potential mock data patterns
    const possibleMockOrders = bookings.filter(booking => 
      booking.service_name?.toLowerCase().includes('test') ||
      booking.service_name?.toLowerCase().includes('mock') ||
      booking.service_name?.toLowerCase().includes('sample') ||
      booking.users?.email?.includes('test') ||
      booking.users?.email?.includes('example')
    );
    
    if (possibleMockOrders.length > 0) {
      console.log(`\n⚠️  Potential mock orders found: ${possibleMockOrders.length}`);
      possibleMockOrders.forEach(order => {
        console.log(`   - Order #${order.id.slice(-6).toUpperCase()}: ${order.service_name}`);
      });
    } else {
      console.log('\n✅ No obvious mock data patterns detected');
    }

    // Summary for Move to Next Stage functionality
    const ordersReadyForStageUpdates = bookings.filter(booking => 
      booking.tracking_stage && booking.pickup_option && booking.user_id
    );
    
    console.log(`\n🚀 Summary for "Move to Next Stage" functionality:`);
    console.log(`   Total orders: ${bookings.length}`);
    console.log(`   Orders ready for stage updates: ${ordersReadyForStageUpdates.length}`);
    console.log(`   Orders missing required fields: ${bookings.length - ordersReadyForStageUpdates.length}`);

  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

checkRealOrders();