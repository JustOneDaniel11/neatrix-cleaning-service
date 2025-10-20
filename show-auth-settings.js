#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env') });

console.log('🔍 Supabase Authentication Settings Viewer');
console.log('==========================================\n');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure you have:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthSettings() {
    try {
        console.log('📍 Project URL:', supabaseUrl);
        console.log('🔑 Using Anonymous Key (first 20 chars):', supabaseKey.substring(0, 20) + '...\n');

        // Test basic connection
        console.log('🔗 Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        if (error && error.message !== 'Auth session missing!') {
            console.error('❌ Connection failed:', error.message);
            return;
        }
        console.log('✅ Connection successful\n');

        // Test email signup to see the actual error
        console.log('📧 Testing email signup process...');
        const testEmail = `test-${Date.now()}@example.com`;
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!'
        });

        if (signupError) {
            console.log('❌ Email signup failed with error:');
            console.log('   Error:', signupError.message);
            console.log('   Code:', signupError.status || 'N/A');
            
            if (signupError.message.includes('sending confirmation email')) {
                console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
                console.log('   The error confirms SMTP is not properly configured');
                console.log('   Even though you set it in the dashboard, it\'s not working');
            }
        } else {
            console.log('✅ Email signup successful');
            console.log('   User created:', signupData.user?.id);
            console.log('   Email sent:', !signupData.user?.email_confirmed_at ? 'Yes' : 'Already confirmed');
        }

        console.log('\n📋 SUMMARY:');
        console.log('============');
        
        if (signupError && signupError.message.includes('sending confirmation email')) {
            console.log('❌ SMTP Configuration Issue Confirmed');
            console.log('');
            console.log('🔧 SOLUTIONS:');
            console.log('1. Double-check Gmail App Password (16 characters, no spaces)');
            console.log('2. Verify 2FA is enabled on contactneatrix@gmail.com');
            console.log('3. Ensure SMTP settings are SAVED in Supabase Dashboard');
            console.log('4. Try regenerating Gmail App Password');
            console.log('');
            console.log('📍 Current SMTP should be:');
            console.log('   Host: smtp.gmail.com');
            console.log('   Port: 587');
            console.log('   Username: contactneatrix@gmail.com');
            console.log('   Password: [Your 16-character Gmail App Password]');
            console.log('   Sender Email: contactneatrix@gmail.com');
            console.log('   Sender Name: Neatrix Professional Cleaning Services');
        } else {
            console.log('✅ Email verification appears to be working');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkAuthSettings();