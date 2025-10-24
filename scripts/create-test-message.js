#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load env from admin-dashboard/.env if present
const envPath = path.join(__dirname, '..', 'admin-dashboard', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Fallbacks if .env not present
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    // Cleanup: keep only the last message from user named "Bolaji Paul"
    const { data: bolaji } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('name', 'Bolaji Paul')
      .order('created_at', { ascending: false })
      .limit(1);

    // Delete all messages
    await supabase.from('contact_messages').delete().neq('id', '');

    // Reinsert last Bolaji message if exists
    if (bolaji && bolaji.length > 0) {
      const last = bolaji[0];
      await supabase.from('contact_messages').insert({
        name: last.name,
        email: last.email,
        phone: last.phone,
        message: last.message,
        status: 'new'
      });
    }

    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(1).single();
    if (error) {
      console.error('Insert message failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Contact messages reset. Remaining latest message:', data);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();