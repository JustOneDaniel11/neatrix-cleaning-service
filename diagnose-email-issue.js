/**
 * Comprehensive Email Verification Diagnostic Tool
 * ===============================================
 * 
 * This script performs multiple tests to identify why email verification is failing
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvVars() {
    const envPaths = [
        path.join(__dirname, 'admin-dashboard', '.env'),
        path.join(__dirname, 'user-frontend', '.env'),
        path.join(__dirname, '.env')
    ];

    let config = {};
    
    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            console.log(`📁 Found .env file: ${envPath}`);
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    config[key.trim()] = value.trim().replace(/['"]/g, '');
                }
            });
        }
    }
    
    return config;
}

async function testSupabaseConnection(supabaseUrl, supabaseKey) {
    console.log('\n🔗 Testing Supabase Connection...');
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test basic connection
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.log('❌ Connection test failed:', error.message);
            return false;
        } else {
            console.log('✅ Supabase connection successful');
            return true;
        }
    } catch (err) {
        console.log('❌ Connection error:', err.message);
        return false;
    }
}

async function checkAuthSettings(supabaseUrl, serviceKey) {
    console.log('\n⚙️  Checking Authentication Settings...');
    
    try {
        const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
        if (!projectRef) {
            console.log('❌ Could not extract project reference from URL');
            return;
        }

        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(`❌ Auth config check failed: ${response.status} - ${response.statusText}`);
            if (response.status === 401) {
                console.log('🔑 This suggests the Service Role Key is incorrect or invalid');
            }
            return;
        }

        const authConfig = await response.json();
        
        console.log('📋 Current Auth Configuration:');
        console.log(`   📧 Email confirmations: ${authConfig.enable_confirmations ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`   📝 Signup enabled: ${authConfig.enable_signup ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`   🌐 Site URL: ${authConfig.site_url || '❌ Not set'}`);
        console.log(`   📮 SMTP Host: ${authConfig.smtp_host || '❌ Not set'}`);
        console.log(`   🔌 SMTP Port: ${authConfig.smtp_port || '❌ Not set'}`);
        console.log(`   👤 SMTP User: ${authConfig.smtp_user || '❌ Not set'}`);
        console.log(`   🔐 SMTP Password: ${authConfig.smtp_pass ? '✅ Set' : '❌ Not set'}`);
        console.log(`   📧 Admin Email: ${authConfig.smtp_admin_email || '❌ Not set'}`);
        
        // Check for common issues
        const issues = [];
        if (!authConfig.enable_confirmations) issues.push('Email confirmations are disabled');
        if (!authConfig.smtp_host) issues.push('SMTP host not configured');
        if (!authConfig.smtp_user) issues.push('SMTP user not configured');
        if (!authConfig.smtp_pass) issues.push('SMTP password not configured');
        if (!authConfig.site_url) issues.push('Site URL not configured');
        
        if (issues.length > 0) {
            console.log('\n⚠️  Issues Found:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        } else {
            console.log('\n✅ Auth configuration looks complete');
        }
        
        return authConfig;
        
    } catch (err) {
        console.log('❌ Error checking auth settings:', err.message);
    }
}

async function testEmailSignup(supabaseUrl, supabaseKey) {
    console.log('\n🧪 Testing Email Signup Process...');
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const testEmail = `test.${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        console.log(`📧 Testing with email: ${testEmail}`);
        
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.log('❌ Signup failed:', error.message);
            
            // Analyze specific error types
            if (error.message.includes('confirmation')) {
                console.log('🔍 This is likely an email configuration issue');
            } else if (error.message.includes('SMTP')) {
                console.log('🔍 This is definitely an SMTP configuration issue');
            } else if (error.message.includes('rate limit')) {
                console.log('🔍 Rate limiting - try again later');
            }
            
            return false;
        } else {
            console.log('✅ Signup successful!');
            console.log(`👤 User ID: ${data.user?.id}`);
            console.log(`📧 Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`);
            
            if (!data.user?.email_confirmed_at) {
                console.log('📬 Verification email should have been sent');
            }
            
            return true;
        }
    } catch (err) {
        console.log('❌ Signup test error:', err.message);
        return false;
    }
}

async function testDirectSMTP() {
    console.log('\n📮 Testing Direct SMTP Connection...');
    
    try {
        const nodemailer = require('nodemailer');
        
        // This would require the actual SMTP credentials
        console.log('ℹ️  Direct SMTP test requires nodemailer package');
        console.log('   Run: npm install nodemailer');
        console.log('   This test can verify if Gmail SMTP works independently');
        
    } catch (err) {
        console.log('ℹ️  Nodemailer not available for direct SMTP testing');
    }
}

async function checkEmailTemplates() {
    console.log('\n📄 Checking Email Templates...');
    
    const templatePath = path.join(__dirname, 'user-frontend', 'src', 'email-templates');
    
    if (!fs.existsSync(templatePath)) {
        console.log('❌ Email templates directory not found');
        return;
    }
    
    const templates = fs.readdirSync(templatePath).filter(file => file.endsWith('.html'));
    console.log(`📁 Found ${templates.length} email templates:`);
    
    templates.forEach(template => {
        const templateFile = path.join(templatePath, template);
        const stats = fs.statSync(templateFile);
        console.log(`   ✅ ${template} (${Math.round(stats.size / 1024)}KB)`);
    });
    
    // Check if templates contain required placeholders
    const confirmationTemplate = path.join(templatePath, 'neatrix-signup-confirmation.html');
    if (fs.existsSync(confirmationTemplate)) {
        const content = fs.readFileSync(confirmationTemplate, 'utf8');
        const hasConfirmLink = content.includes('{{ .ConfirmationURL }}') || content.includes('{{.ConfirmationURL}}');
        console.log(`   🔗 Confirmation link placeholder: ${hasConfirmLink ? '✅ Found' : '❌ Missing'}`);
    }
}

async function main() {
    console.log('🔍 Email Verification Diagnostic Tool');
    console.log('=====================================\n');
    
    // Load configuration
    const config = loadEnvVars();
    
    const supabaseUrl = config.VITE_SUPABASE_URL;
    const supabaseAnonKey = config.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Missing Supabase configuration in .env files');
        console.log('   Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
        return;
    }
    
    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Using Anonymous Key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    // Run diagnostics
    const connectionOk = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    
    if (!connectionOk) {
        console.log('\n❌ Cannot proceed - Supabase connection failed');
        return;
    }
    
    // For auth settings check, we need service role key
    console.log('\n🔐 For complete diagnosis, we need the Service Role Key');
    console.log('   (This is different from the Anonymous Key)');
    
    // Test signup with anon key
    await testEmailSignup(supabaseUrl, supabaseAnonKey);
    
    // Check templates
    await checkEmailTemplates();
    
    // SMTP test info
    await testDirectSMTP();
    
    console.log('\n📋 Summary & Next Steps:');
    console.log('========================');
    console.log('1. ✅ Check Supabase connection');
    console.log('2. 🔍 Test email signup process');
    console.log('3. 📄 Verify email templates exist');
    console.log('4. ⚙️  Need Service Role Key for auth config check');
    console.log('\n💡 If signup fails with "Error sending confirmation email":');
    console.log('   - Verify SMTP settings in Supabase Dashboard');
    console.log('   - Check Gmail App Password is correct');
    console.log('   - Ensure email confirmations are enabled');
    console.log('   - Verify site URL is set correctly');
}

// Run diagnostics
main().catch(console.error);