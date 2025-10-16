import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUsersTable() {
  console.log('🔍 Checking users table...');
  
  try {
    // Try to fetch from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table exists');
      console.log('📋 Sample user structure:');
      if (users && users.length > 0) {
        console.log('Fields:', Object.keys(users[0]));
        console.log('Sample data:', users[0]);
      } else {
        console.log('No users found');
      }
    }
    
    // Check what user_id references in bookings
    console.log('\n🔍 Checking bookings with user_id...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, user_id, service_name, phone')
      .limit(3);
    
    if (bookingsError) {
      console.log('❌ Bookings error:', bookingsError.message);
    } else {
      console.log('✅ Sample bookings:');
      bookings?.forEach(booking => {
        console.log(`  - ID: ${booking.id.slice(-6)}, User ID: ${booking.user_id}, Service: ${booking.service_name}, Phone: ${booking.phone}`);
      });
    }
    
    // Try to join bookings with users
    console.log('\n🔍 Testing bookings-users join...');
    const { data: joinData, error: joinError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        service_name,
        users (
          id,
          email,
          full_name
        )
      `)
      .limit(1);
    
    if (joinError) {
      console.log('❌ Join error:', joinError.message);
      console.log('💡 This suggests the users table doesn\'t exist or the relationship is not set up');
    } else {
      console.log('✅ Join successful:');
      console.log(JSON.stringify(joinData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUsersTable();