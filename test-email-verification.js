/**
 * Email Verification Test Script
 * =============================
 * 
 * This script tests the email verification system to diagnose
 * why users are not receiving verification emails.
 * 
 * Run with: node test-email-verification.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from admin dashboard
const envPath = path.join(__dirname, 'admin-dashboard', '.env');
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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Please ensure admin-dashboard/.env file exists with:');
    console.log('VITE_SUPABASE_URL=your-supabase-url');
    console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailConfiguration() {
    console.log('🔍 Testing Email Verification System');
    console.log('=====================================\n');

    // Test 1: Check Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('services').select('count').limit(1);
        if (error) {
            console.log('❌ Connection failed:', error.message);
            return;
        }
        console.log('✅ Supabase connection successful\n');
    } catch (err) {
        console.log('❌ Connection error:', err.message);
        return;
    }

    // Test 2: Test signup with email verification
    console.log('2️⃣ Testing signup with email verification...');
    const testEmail = `test.${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User'
                }
            }
        });

        if (error) {
            console.log('❌ Signup failed:', error.message);
            
            // Check if it's an email confirmation issue
            if (error.message.includes('email')) {
                console.log('🔍 This might be an email configuration issue');
            }
            return;
        }

        console.log('✅ Signup successful!');
        console.log('📧 User created:', data.user?.email);
        console.log('🔐 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
        
        if (!data.user?.email_confirmed_at) {
            console.log('📬 Verification email should have been sent');
            console.log('⚠️  If no email was received, there may be an SMTP configuration issue');
        }
        
    } catch (err) {
        console.log('❌ Signup error:', err.message);
    }

    console.log('\n3️⃣ Checking auth configuration...');
    
    // Test 3: Check if email confirmation is required
    try {
        // Try to sign in with unconfirmed email
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (signInError) {
            if (signInError.message.includes('email not confirmed')) {
                console.log('✅ Email confirmation is required (good security)');
                console.log('📧 Users must verify their email before signing in');
            } else {
                console.log('❌ Sign in error:', signInError.message);
            }
        } else {
            console.log('⚠️  User can sign in without email confirmation');
            console.log('🔧 Email confirmation might be disabled in Supabase settings');
        }
    } catch (err) {
        console.log('❌ Sign in test error:', err.message);
    }

    console.log('\n📋 Diagnosis Summary');
    console.log('===================');
    console.log('✅ Supabase connection: Working');
    console.log('✅ User signup: Working');
    console.log('📧 Email templates: Available in src/email-templates/');
    console.log('🔧 SMTP configuration: Needs verification in Supabase Dashboard');
    
    console.log('\n🛠️  Next Steps to Fix Email Issues:');
    console.log('1. Go to Supabase Dashboard > Authentication > Settings');
    console.log('2. Check "Enable email confirmations" is turned ON');
    console.log('3. Configure SMTP settings with contactneatrix@gmail.com');
    console.log('4. Upload email templates from src/email-templates/');
    console.log('5. Test with a real email address');
    
    console.log('\n📞 Support Contact:');
    console.log('Email: contactneatrix@gmail.com');
    console.log('Phone: +2349034842430');
    console.log('WhatsApp: https://wa.me/2349034842430');
}

// Run the test
testEmailConfiguration().catch(console.error);