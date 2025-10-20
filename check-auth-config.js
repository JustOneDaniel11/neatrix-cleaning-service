/**
 * Authentication Configuration Checker
 * ===================================
 * 
 * This script checks the current auth configuration in Supabase
 * to identify why email verification is failing
 */

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => new Promise(resolve => readline.question(prompt, resolve));

async function checkAuthConfig() {
    console.log('🔐 Authentication Configuration Checker');
    console.log('======================================\n');
    
    try {
        const supabaseUrl = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
        const projectRef = 'hrkpbuenwejwspjrfgkd';
        
        console.log(`📍 Project: ${projectRef}`);
        
        const serviceKey = await question('Enter your Supabase Service Role Key: ');
        
        console.log('\n🔍 Checking current authentication configuration...');
        
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ Auth config check failed: ${response.status}`);
            console.log(`Error: ${errorText}`);
            
            if (response.status === 401) {
                console.log('\n🔑 The Service Role Key appears to be incorrect.');
                console.log('   Please verify you\'re using the SERVICE ROLE key, not the ANON key.');
                console.log('   Find it in: Supabase Dashboard > Settings > API > service_role key');
            }
            return;
        }

        const authConfig = await response.json();
        
        console.log('\n📋 Current Authentication Configuration:');
        console.log('==========================================');
        
        // Email settings
        console.log('\n📧 Email Configuration:');
        console.log(`   Enable Confirmations: ${authConfig.enable_confirmations ? '✅ YES' : '❌ NO'}`);
        console.log(`   Enable Signup: ${authConfig.enable_signup ? '✅ YES' : '❌ NO'}`);
        console.log(`   Site URL: ${authConfig.site_url || '❌ NOT SET'}`);
        
        // SMTP settings
        console.log('\n📮 SMTP Configuration:');
        console.log(`   SMTP Host: ${authConfig.smtp_host || '❌ NOT SET'}`);
        console.log(`   SMTP Port: ${authConfig.smtp_port || '❌ NOT SET'}`);
        console.log(`   SMTP User: ${authConfig.smtp_user || '❌ NOT SET'}`);
        console.log(`   SMTP Password: ${authConfig.smtp_pass ? '✅ SET' : '❌ NOT SET'}`);
        console.log(`   SMTP Admin Email: ${authConfig.smtp_admin_email || '❌ NOT SET'}`);
        
        // Email templates
        console.log('\n📄 Email Templates:');
        console.log(`   Confirmation Subject: ${authConfig.mailer_subjects_confirmation || '❌ NOT SET'}`);
        console.log(`   Recovery Subject: ${authConfig.mailer_subjects_recovery || '❌ NOT SET'}`);
        console.log(`   Confirmation Template: ${authConfig.mailer_templates_confirmation_content ? '✅ SET' : '❌ NOT SET'}`);
        console.log(`   Recovery Template: ${authConfig.mailer_templates_recovery_content ? '✅ SET' : '❌ NOT SET'}`);
        
        // Security settings
        console.log('\n🔒 Security Settings:');
        console.log(`   JWT Expiry: ${authConfig.jwt_exp || 'Default'}`);
        console.log(`   Refresh Token Rotation: ${authConfig.refresh_token_rotation_enabled ? '✅ YES' : '❌ NO'}`);
        
        // Analyze issues
        console.log('\n🔍 Issue Analysis:');
        console.log('==================');
        
        const criticalIssues = [];
        const warnings = [];
        
        if (!authConfig.enable_confirmations) {
            criticalIssues.push('Email confirmations are DISABLED');
        }
        
        if (!authConfig.smtp_host) {
            criticalIssues.push('SMTP host is NOT configured');
        }
        
        if (!authConfig.smtp_user) {
            criticalIssues.push('SMTP user is NOT configured');
        }
        
        if (!authConfig.smtp_pass) {
            criticalIssues.push('SMTP password is NOT configured');
        }
        
        if (!authConfig.site_url) {
            warnings.push('Site URL is not set (may cause redirect issues)');
        }
        
        if (!authConfig.mailer_templates_confirmation_content) {
            warnings.push('Custom email template is not configured');
        }
        
        if (authConfig.smtp_host && authConfig.smtp_host !== 'smtp.gmail.com') {
            warnings.push(`SMTP host is "${authConfig.smtp_host}" - expected "smtp.gmail.com" for Gmail`);
        }
        
        if (authConfig.smtp_port && ![465, 587].includes(parseInt(authConfig.smtp_port))) {
            warnings.push(`SMTP port is "${authConfig.smtp_port}" - expected 465 or 587 for Gmail`);
        }
        
        // Display issues
        if (criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES (Must Fix):');
            criticalIssues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }
        
        if (criticalIssues.length === 0 && warnings.length === 0) {
            console.log('✅ Configuration looks good!');
            console.log('\nIf emails are still not sending, the issue might be:');
            console.log('   - Gmail App Password is incorrect');
            console.log('   - Gmail account has 2FA disabled');
            console.log('   - Rate limiting from Gmail');
            console.log('   - Supabase service temporary issues');
        }
        
        // Provide fix suggestions
        if (criticalIssues.length > 0) {
            console.log('\n🛠️  HOW TO FIX:');
            console.log('===============');
            console.log('1. Go to Supabase Dashboard > Authentication > Settings');
            console.log('2. Scroll down to "SMTP Settings"');
            console.log('3. Configure the following:');
            console.log('   - Enable Custom SMTP: ON');
            console.log('   - Sender name: Neatrix Professional Cleaning Services');
            console.log('   - Sender email: contactneatrix@gmail.com');
            console.log('   - Host: smtp.gmail.com');
            console.log('   - Port: 465');
            console.log('   - Username: contactneatrix@gmail.com');
            console.log('   - Password: [Gmail App Password - 16 characters]');
            console.log('4. Save the configuration');
            console.log('5. Test signup again');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        readline.close();
    }
}

checkAuthConfig();