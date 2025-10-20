/**
 * Email Verification Fix Script
 * ============================
 * 
 * This script helps configure email verification settings in Supabase
 * using the Management API.
 * 
 * Prerequisites:
 * 1. Supabase Service Role Key
 * 2. Gmail App Password for contactneatrix@gmail.com
 * 
 * Usage: node fix-email-verification.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // These will be prompted or read from environment
    supabaseUrl: '',
    supabaseServiceKey: '',
    gmailAppPassword: '',
    siteUrl: 'http://localhost:8080', // Change for production
    projectRef: '' // Will be extracted from URL
};

// Email templates
const EMAIL_TEMPLATES = {
    confirmation: {
        subject: "Welcome to Neatrix! 🎉 — Confirm your account",
        bodyHtml: fs.readFileSync(
            path.join(__dirname, 'user-frontend/src/email-templates/neatrix-signup-confirmation.html'), 
            'utf8'
        )
    },
    recovery: {
        subject: "Reset Your Neatrix Password 🔐",
        bodyHtml: fs.readFileSync(
            path.join(__dirname, 'user-frontend/src/email-templates/neatrix-password-reset.html'), 
            'utf8'
        )
    }
};

async function promptForCredentials() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => readline.question(prompt, resolve));

    console.log('🔧 Email Verification Configuration Setup');
    console.log('=========================================\n');

    try {
        // Load from admin dashboard .env if available
        const envPath = path.join(__dirname, 'admin-dashboard', '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    if (key.trim() === 'VITE_SUPABASE_URL') {
                        CONFIG.supabaseUrl = value.trim();
                    }
                }
            });
        }

        if (CONFIG.supabaseUrl) {
            console.log(`✅ Found Supabase URL: ${CONFIG.supabaseUrl}`);
            // Extract project reference from URL
            const match = CONFIG.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
            if (match) {
                CONFIG.projectRef = match[1];
                console.log(`✅ Project Reference: ${CONFIG.projectRef}`);
            }
        } else {
            CONFIG.supabaseUrl = await question('Enter your Supabase URL: ');
            const match = CONFIG.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
            if (match) {
                CONFIG.projectRef = match[1];
            } else {
                console.log('❌ Invalid Supabase URL format');
                process.exit(1);
            }
        }

        CONFIG.supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');
        CONFIG.gmailAppPassword = await question('Enter Gmail App Password for contactneatrix@gmail.com: ');

        console.log('\n📋 Configuration Summary:');
        console.log(`Project: ${CONFIG.projectRef}`);
        console.log(`Site URL: ${CONFIG.siteUrl}`);
        console.log(`SMTP User: contactneatrix@gmail.com`);
        console.log(`Templates: ${Object.keys(EMAIL_TEMPLATES).length} ready`);

        const confirm = await question('\nProceed with configuration? (y/N): ');
        if (confirm.toLowerCase() !== 'y') {
            console.log('❌ Configuration cancelled');
            process.exit(0);
        }

    } finally {
        readline.close();
    }
}

async function configureEmailSettings() {
    console.log('\n🚀 Configuring email settings...');

    const authConfig = {
        mailer_subjects_confirmation: EMAIL_TEMPLATES.confirmation.subject,
        mailer_templates_confirmation_content: EMAIL_TEMPLATES.confirmation.bodyHtml,
        mailer_subjects_recovery: EMAIL_TEMPLATES.recovery.subject,
        mailer_templates_recovery_content: EMAIL_TEMPLATES.recovery.bodyHtml,
        site_url: CONFIG.siteUrl,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_user: 'contactneatrix@gmail.com',
        smtp_pass: CONFIG.gmailAppPassword,
        smtp_admin_email: 'contactneatrix@gmail.com',
        enable_confirmations: true,
        enable_signup: true
    };

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${CONFIG.projectRef}/config/auth`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${CONFIG.supabaseServiceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authConfig)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }

        console.log('✅ Email configuration updated successfully!');
        
        // Verify configuration
        console.log('\n🔍 Verifying configuration...');
        const verifyResponse = await fetch(`https://api.supabase.com/v1/projects/${CONFIG.projectRef}/config/auth`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.supabaseServiceKey}`
            }
        });

        if (verifyResponse.ok) {
            const config = await verifyResponse.json();
            console.log('✅ Configuration verified');
            console.log(`📧 SMTP Host: ${config.smtp_host || 'Not set'}`);
            console.log(`📮 SMTP User: ${config.smtp_user || 'Not set'}`);
            console.log(`🌐 Site URL: ${config.site_url || 'Not set'}`);
            console.log(`✉️  Email Confirmations: ${config.enable_confirmations ? 'Enabled' : 'Disabled'}`);
        }

    } catch (error) {
        console.error('❌ Configuration failed:', error.message);
        console.log('\n🛠️  Manual Configuration Required:');
        console.log('1. Go to Supabase Dashboard > Authentication > Settings');
        console.log('2. Configure SMTP settings manually');
        console.log('3. Upload email templates');
        process.exit(1);
    }
}

async function testEmailDelivery() {
    console.log('\n🧪 Testing email delivery...');
    
    // Import the test script functionality
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

    const testEmail = `test.${Date.now()}@example.com`;
    
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: 'TestPassword123!',
            email_confirm: false // This will trigger confirmation email
        });

        if (error) {
            console.log('❌ Test failed:', error.message);
        } else {
            console.log('✅ Test user created successfully');
            console.log('📧 Verification email should be sent');
            console.log(`📬 Check inbox for: ${testEmail}`);
        }
    } catch (err) {
        console.log('❌ Test error:', err.message);
    }
}

async function main() {
    try {
        await promptForCredentials();
        await configureEmailSettings();
        await testEmailDelivery();
        
        console.log('\n🎉 Email verification setup complete!');
        console.log('\n📋 Next Steps:');
        console.log('1. Test signup with a real email address');
        console.log('2. Check email delivery and template rendering');
        console.log('3. Verify redirect URLs work correctly');
        console.log('\n📞 Support: contactneatrix@gmail.com | +2349034842430');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n📖 See EMAIL-VERIFICATION-FIX-GUIDE.md for manual setup instructions');
    }
}

// Check if required files exist
const requiredFiles = [
    'user-frontend/src/email-templates/neatrix-signup-confirmation.html',
    'user-frontend/src/email-templates/neatrix-password-reset.html'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
if (missingFiles.length > 0) {
    console.error('❌ Missing required email template files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\nPlease ensure email templates are available before running this script.');
    process.exit(1);
}

// Run the setup
main().catch(console.error);