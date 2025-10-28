import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkzqasgyvvmjlgpfplrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5renFhc2d5dnZtamxncGZwbHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NzI4NzQsImV4cCI6MjA0ODU0ODg3NH0.Ej6jqZGNlwjqnNQjz5c6vQ8GuJXaNKsaZpPJOdaJJQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderStatus() {
  try {
    console.log('🔍 Checking current order statuses...\n');
    
    // Get all orders
    const { data: orders, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('📭 No orders found in database');
      return;
    }

    console.log(`📋 Found ${orders.length} orders:\n`);
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Customer: ${order.customer_name || 'N/A'}`);
      console.log(`   Email: ${order.customer_email || 'N/A'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Service: ${order.service_name || order.service_type || 'N/A'}`);
      console.log(`   Pickup Option: ${order.pickup_option || 'N/A'}`);
      console.log(`   Tracking Stage: ${order.tracking_stage || 'None'}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log('   ---');
    });

    // Show orders that need to be reset
    const nonPendingOrders = orders.filter(order => order.status !== 'pending');
    if (nonPendingOrders.length > 0) {
      console.log(`\n🔄 Orders that can be reset to 'pending':`);
      nonPendingOrders.forEach(order => {
        console.log(`   - Order ${order.id}: ${order.status} → pending`);
      });
    } else {
      console.log(`\n✅ All orders are already in 'pending' status`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkOrderStatus();