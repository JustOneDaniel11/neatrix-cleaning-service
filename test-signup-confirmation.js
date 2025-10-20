#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env') });

console.log('🧪 Email Signup Confirmation Test');
console.log('==================================\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupConfirmation() {
    try {
        // Generate a unique test email
        const timestamp = Date.now();
        const testEmail = `test.user.${timestamp}@example.com`;
        const testPassword = 'TestPassword123!';

        console.log('📧 Testing signup with email:', testEmail);
        console.log('🔒 Password:', testPassword);
        console.log('');

        // Attempt signup
        console.log('🚀 Attempting signup...');
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: `${process.env.VITE_SITE_URL || 'http://localhost:8081'}/auth/callback`
            }
        });

        if (error) {
            console.log('❌ Signup failed:');
            console.log('   Error:', error.message);
            console.log('   Status:', error.status || 'N/A');
            
            if (error.status === 429) {
                console.log('\n⏰ RATE LIMIT DETECTED');
                console.log('   This confirms your email system is working!');
                console.log('   Wait 1-2 hours and try again with a different email.');
                return;
            }
            
            if (error.message.includes('sending confirmation email')) {
                console.log('\n📧 EMAIL CONFIGURATION ISSUE');
                console.log('   The SMTP settings need to be checked.');
            }
            
            return;
        }

        console.log('✅ Signup successful!');
        console.log('');
        console.log('📋 SIGNUP DETAILS:');
        console.log('==================');
        console.log('User ID:', data.user?.id || 'N/A');
        console.log('Email:', data.user?.email || 'N/A');
        console.log('Email Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
        console.log('Created At:', data.user?.created_at || 'N/A');
        
        if (data.user && !data.user.email_confirmed_at) {
            console.log('');
            console.log('📬 CONFIRMATION EMAIL STATUS:');
            console.log('=============================');
            console.log('✅ Confirmation email should be sent to:', testEmail);
            console.log('📧 Check your email inbox (including spam folder)');
            console.log('🔗 Click the confirmation link in the email');
            console.log('');
            console.log('📝 EMAIL TEMPLATE PREVIEW:');
            console.log('==========================');
            console.log('Subject: Confirm Your Signup');
            console.log('Body: Follow this link to confirm your user: [CONFIRMATION_LINK]');
            console.log('');
            console.log('🎯 NEXT STEPS:');
            console.log('==============');
            console.log('1. Check the email inbox for:', testEmail);
            console.log('2. Look for email from: contactneatrix@gmail.com');
            console.log('3. Click the confirmation link');
            console.log('4. User will be confirmed and can log in');
        } else {
            console.log('');
            console.log('⚠️  User was created but email confirmation status is unclear');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testSignupConfirmation();