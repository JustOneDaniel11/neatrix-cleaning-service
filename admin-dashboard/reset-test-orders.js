import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Anon Key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetTestOrders() {
  try {
    // First authenticate as admin
    console.log('🔐 Authenticating as admin...');
    const adminEmail = 'contactneatrix@gmail.com';
    const adminPassword = 'RelaxwithDan_11_123456@JustYou';
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (authError) {
      console.error('❌ Admin authentication failed:', authError.message);
      return;
    }

    console.log('✅ Admin authenticated successfully');
    console.log('🔍 Checking current order statuses...\n');
    
    // First, let's see what orders we have
    const { data: orders, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
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

    // Find orders that are not pending
    const nonPendingOrders = orders.filter(order => order.status !== 'pending');
    
    if (nonPendingOrders.length === 0) {
      console.log(`\n✅ All orders are already in 'pending' status - ready for testing!`);
      return;
    }

    console.log(`\n🔄 Resetting ${nonPendingOrders.length} orders to 'pending' status...\n`);

    // Reset each non-pending order
    for (const order of nonPendingOrders) {
      console.log(`🔄 Resetting Order ${order.id} from '${order.status}' to 'pending'...`);
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'pending',
          tracking_stage: null,
          stage_timestamps: null,
          stage_notes: null,
          tracking_history: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`❌ Error updating order ${order.id}:`, updateError);
      } else {
        console.log(`✅ Order ${order.id} reset to pending`);
      }
    }

    console.log(`\n🎉 Reset complete! All orders should now show 'Approve Order' button in the admin dashboard.`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

resetTestOrders();