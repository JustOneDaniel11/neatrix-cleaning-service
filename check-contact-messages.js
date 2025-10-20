const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env file from admin-dashboard
const envPath = './admin-dashboard/.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContactMessages() {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('Error:', error.message);
      return;
    }
    
    console.log('Total contact messages:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('\nRecent messages:');
      data.slice(0, 5).forEach((msg, i) => {
        console.log(`${i + 1}. From: ${msg.name} (${msg.email})`);
        console.log(`   Subject: ${msg.subject}`);
        console.log(`   Status: ${msg.status}`);
        console.log(`   Created: ${msg.created_at}`);
        console.log('');
      });
    } else {
      console.log('No contact messages found in database');
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

checkContactMessages();