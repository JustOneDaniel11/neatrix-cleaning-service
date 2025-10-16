import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Environment check:');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderFetch() {
  try {
    console.log('\n🔍 Testing database connection...');
    
    // Test 1: Simple fetch
    console.log('\n📋 Test 1: Fetching all orders...');
    const { data: allOrders, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tracking_stage, service_name')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }
    
    console.log('✅ Fetch successful, orders found:', allOrders?.length || 0);
    if (allOrders && allOrders.length > 0) {
      console.log('📋 Orders:', allOrders.map(o => `${o.id} (${o.tracking_stage})`));
      
      // Test 2: Update a specific order
      const testOrderId = allOrders[0].id;
      console.log(`\n🔄 Test 2: Testing update on order ${testOrderId}...`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('bookings')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', testOrderId)
        .select();
      
      if (updateError) {
        console.error('❌ Update error:', updateError);
        return;
      }
      
      if (!updateData || updateData.length === 0) {
        console.warn('⚠️ Update returned no data - this is the issue!');
        console.log('🔍 Checking if record exists...');
        
        const { data: checkData, error: checkError } = await supabase
          .from('bookings')
          .select('id, tracking_stage')
          .eq('id', testOrderId);
          
        if (checkError) {
          console.error('❌ Check error:', checkError);
        } else {
          console.log('📋 Record check result:', checkData);
        }
      } else {
        console.log('✅ Update successful, returned data:', updateData.length, 'records');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.message.includes('fetch')) {
      console.log('🌐 This appears to be a network connectivity issue');
    }
  }
}

testOrderFetch();