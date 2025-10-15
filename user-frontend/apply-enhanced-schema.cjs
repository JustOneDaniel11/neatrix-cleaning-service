const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY || 'example';

console.log('🔧 Configuration:');
console.log('  Supabase URL:', supabaseUrl);
console.log('  Using key:', supabaseServiceKey.substring(0, 20) + '...');

if (supabaseUrl === 'https://example.supabase.co' || supabaseServiceKey === 'example') {
  console.log('⚠️  Using default configuration - please set proper environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyBasicSchemaChanges() {
  console.log('🚀 Applying basic tracking schema changes...');
  
  try {
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if tracking_stage column already exists
    console.log('🔍 Checking existing schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('bookings')
      .select('tracking_stage')
      .limit(1);
    
    if (schemaError && schemaError.message.includes('does not exist')) {
      console.log('📝 tracking_stage column does not exist - schema needs to be applied');
      console.log('');
      console.log('⚠️  Manual Schema Application Required');
      console.log('');
      console.log('The database schema needs to be applied manually through the Supabase dashboard.');
      console.log('Please follow these steps:');
      console.log('');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Navigate to your project: hrkpbuenwejwspjrfgkd');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the contents of enhance-order-tracking.sql');
      console.log('5. Run the SQL script');
      console.log('');
      console.log('📄 The enhance-order-tracking.sql file contains:');
      console.log('  • ALTER TABLE statements to add tracking columns');
      console.log('  • Functions for updating tracking stages');
      console.log('  • Indexes for better performance');
      console.log('  • Policies for security');
      console.log('');
      console.log('After running the SQL script, the tracking functionality will be fully enabled.');
      
    } else if (schemaError) {
      console.error('❌ Schema check error:', schemaError.message);
    } else {
      console.log('✅ tracking_stage column already exists');
      
      // Update existing records to have proper tracking stages
      console.log('📝 Updating existing dry cleaning records...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('bookings')
        .update({
          tracking_stage: 'sorting',
          pickup_option: 'pickup'
        })
        .or('service_type.eq.dry_cleaning,service_name.ilike.%dry%')
        .is('tracking_stage', null);
      
      if (updateError) {
        console.log('⚠️  Update warning:', updateError.message);
      } else {
        console.log('✅ Existing records updated successfully');
      }
      
      console.log('🎉 Schema is already applied and working!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
applyBasicSchemaChanges();