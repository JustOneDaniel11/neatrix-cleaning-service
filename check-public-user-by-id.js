#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const userId = process.argv[2];

(async () => {
  if (!userId) {
    console.error('Usage: node check-public-user-by-id.js <user_id>');
    process.exit(1);
  }
  const { data, error } = await supabase.from('users').select('*').eq('id', userId);
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log('public.users record:', data);
})();