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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contactneatrix@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'RelaxwithDan_11_123456@JustYou';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function ensureAdminAuth(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Admin auth failed: ${error.message}`);
  }
  return data.user;
}

async function main() {
  try {
    console.log('🔐 Authenticating as admin...');
    const user = await ensureAdminAuth(ADMIN_EMAIL, ADMIN_PASSWORD);
    if (!user) throw new Error('No user after auth');

    console.log('🔍 Fetching all payments to identify mock/test payments...');
    
    // Fetch all payments
    const { data: payments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch payments: ${fetchError.message}`);
    }

    console.log(`📊 Found ${payments.length} total payments`);

    // Identify mock/test payments based on common patterns
    const mockPayments = payments.filter(payment => {
      const description = payment.description || '';
      const transactionRef = payment.transaction_reference || '';
      const gatewayRef = payment.gateway_reference || '';
      
      return (
        description.toLowerCase().includes('test') ||
        description.toLowerCase().includes('mock') ||
        description.toLowerCase().includes('seed') ||
        description.toLowerCase().includes('demo') ||
        transactionRef.startsWith('ref_') ||
        gatewayRef.includes('test') ||
        gatewayRef.includes('AUTH_test') ||
        payment.amount === 5000.00 // Common test amount
      );
    });

    console.log(`🎯 Identified ${mockPayments.length} mock/test payments:`);
    mockPayments.forEach(payment => {
      console.log(`  - ID: ${payment.id}, Amount: ₦${payment.amount}, Description: ${payment.description || 'N/A'}`);
    });

    if (mockPayments.length === 0) {
      console.log('✅ No mock payments found to remove.');
      return;
    }

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(`\n⚠️  Are you sure you want to delete ${mockPayments.length} mock payments? (y/N): `, resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled.');
      return;
    }

    // Delete mock payments
    console.log('🗑️  Deleting mock payments...');
    const mockPaymentIds = mockPayments.map(p => p.id);
    
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .in('id', mockPaymentIds);

    if (deleteError) {
      throw new Error(`Failed to delete payments: ${deleteError.message}`);
    }

    console.log(`✅ Successfully deleted ${mockPayments.length} mock payments!`);
    console.log('🔄 The admin dashboard will now show only real payment data.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();