/**
 * Neatrix Email Templates - Supabase API Deployment Script
 * ========================================================
 * 
 * This script uses the Supabase Management API to configure email templates
 * Run this with Node.js after installing the required dependencies
 * 
 * Installation:
 * npm install @supabase/supabase-js dotenv
 * 
 * Usage:
 * 1. Create a .env file with your Supabase credentials
 * 2. Run: node supabase-api-deployment.js
 * 
 * Contact: contactneatrix@gmail.com | +2349034842430
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these values
const CONFIG = {
    supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
    siteUrl: process.env.SITE_URL || 'https://your-domain.com',
    smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        user: 'contactneatrix@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-gmail-app-password',
        adminEmail: 'contactneatrix@gmail.com',
        maxFrequency: 60
    }
};

// Email Templates
const EMAIL_TEMPLATES = {
    confirmation: {
        subject: "Welcome to Neatrix! 🎉 — Confirm your account",
        bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Neatrix!</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #1e293b; margin-bottom: 16px; }
        .content p { color: #475569; margin-bottom: 32px; line-height: 1.7; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0; }
        .alt-link { margin: 32px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .alt-link p { margin: 0; font-size: 14px; color: #64748b; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; font-size: 14px; color: #64748b; }
        .footer a { color: #6a1b9a; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Neatrix! 🎉</h1>
            <p>Your cleaning service journey starts here</p>
        </div>
        <div class="content">
            <h2>Thanks for joining Neatrix!</h2>
            <p>We're excited to have you as part of our community. To get started with our premium cleaning services, please confirm your email address by clicking the button below.</p>
            <a href="{{ .ConfirmationURL }}" class="cta-button">Confirm My Email</a>
            <div class="alt-link">
                <p><strong>Button not working?</strong><br>Copy and paste this link: {{ .ConfirmationURL }}</p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Need help?</strong> Contact contactneatrix@gmail.com</p>
            <div style="margin-top: 16px;">
                <a href="mailto:contactneatrix@gmail.com">contactneatrix@gmail.com</a>
                <a href="tel:+2349034842430">📞 +2349034842430</a>
                <a href="https://wa.me/2349034842430">WhatsApp</a>
            </div>
        </div>
    </div>
</body>
</html>`
    },
    recovery: {
        subject: "Reset Your Neatrix Password 🔐",
        bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #1e293b; margin-bottom: 16px; }
        .content p { color: #475569; margin-bottom: 32px; line-height: 1.7; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0; }
        .expiry-notice { margin: 32px 0; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; }
        .expiry-notice p:first-child { margin: 0; color: #92400e; font-weight: 600; }
        .expiry-notice p:last-child { margin: 8px 0 0; color: #b45309; font-size: 14px; }
        .alt-link { margin: 32px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .alt-link p { margin: 0; font-size: 14px; color: #64748b; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; font-size: 14px; color: #64748b; }
        .footer a { color: #6a1b9a; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request 🔐</h1>
            <p>Let's get you back into your account</p>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>No worries! It happens to the best of us. Click the button below to create a new password for your Neatrix account and get back to booking amazing cleaning services.</p>
            <a href="{{ .ConfirmationURL }}" class="cta-button">Reset My Password</a>
            <div class="expiry-notice">
                <p>⏳ Important: Link Expires Soon</p>
                <p>This password reset link will expire in 1 hour for security reasons.</p>
            </div>
            <div class="alt-link">
                <p><strong>Button not working?</strong><br>Copy and paste this link: {{ .ConfirmationURL }}</p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Need help?</strong> Contact contactneatrix@gmail.com</p>
            <div style="margin-top: 16px;">
                <a href="mailto:contactneatrix@gmail.com">contactneatrix@gmail.com</a>
                <a href="tel:+2349034842430">📞 +2349034842430</a>
                <a href="https://wa.me/2349034842430">WhatsApp</a>
            </div>
        </div>
    </div>
</body>
</html>`
    }
};

// Initialize Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

/**
 * Deploy email templates to Supabase
 */
async function deployEmailTemplates() {
    console.log('🚀 Starting Neatrix Email Templates Deployment...\n');

    try {
        // 1. Update Signup Confirmation Template
        console.log('📧 Updating signup confirmation template...');
        const { error: confirmationError } = await supabase.auth.admin.updateEmailTemplate(
            'confirmation',
            {
                subject: EMAIL_TEMPLATES.confirmation.subject,
                body: EMAIL_TEMPLATES.confirmation.bodyHtml
            }
        );

        if (confirmationError) {
            console.error('❌ Error updating confirmation template:', confirmationError);
        } else {
            console.log('✅ Signup confirmation template updated successfully');
        }

        // 2. Update Password Reset Template
        console.log('🔐 Updating password reset template...');
        const { error: recoveryError } = await supabase.auth.admin.updateEmailTemplate(
            'recovery',
            {
                subject: EMAIL_TEMPLATES.recovery.subject,
                body: EMAIL_TEMPLATES.recovery.bodyHtml
            }
        );

        if (recoveryError) {
            console.error('❌ Error updating recovery template:', recoveryError);
        } else {
            console.log('✅ Password reset template updated successfully');
        }

        // 3. Update SMTP Configuration
        console.log('📮 Updating SMTP configuration...');
        const { error: smtpError } = await supabase.auth.admin.updateConfig({
            smtp: CONFIG.smtpConfig
        });

        if (smtpError) {
            console.error('❌ Error updating SMTP config:', smtpError);
        } else {
            console.log('✅ SMTP configuration updated successfully');
        }

        // 4. Update Site URL
        console.log('🌐 Updating site URL...');
        const { error: siteUrlError } = await supabase.auth.admin.updateConfig({
            site_url: CONFIG.siteUrl
        });

        if (siteUrlError) {
            console.error('❌ Error updating site URL:', siteUrlError);
        } else {
            console.log('✅ Site URL updated successfully');
        }

        console.log('\n🎉 Deployment completed!');
        console.log('\n📋 Next Steps:');
        console.log('1. Test email delivery in your application');
        console.log('2. Check spam folder for test emails');
        console.log('3. Verify contact information is correct');
        console.log('4. Monitor email delivery rates');
        console.log('\n📞 Support: contactneatrix@gmail.com | +2349034842430');

    } catch (error) {
        console.error('💥 Deployment failed:', error);
        process.exit(1);
    }
}

/**
 * Verify configuration
 */
async function verifyConfiguration() {
    console.log('\n🔍 Verifying configuration...');

    try {
        const { data: config, error } = await supabase.auth.admin.getConfig();

        if (error) {
            console.error('❌ Error fetching config:', error);
            return;
        }

        console.log('📧 Email Templates:', config.email_templates ? '✅ Configured' : '❌ Not configured');
        console.log('📮 SMTP Settings:', config.smtp ? '✅ Configured' : '❌ Not configured');
        console.log('🌐 Site URL:', config.site_url || '❌ Not configured');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

/**
 * Main execution
 */
async function main() {
    // Validate environment variables
    if (!CONFIG.supabaseUrl || CONFIG.supabaseUrl.includes('your-project')) {
        console.error('❌ Please set SUPABASE_URL in your .env file');
        process.exit(1);
    }

    if (!CONFIG.supabaseServiceKey || CONFIG.supabaseServiceKey.includes('your-service-role-key')) {
        console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY in your .env file');
        process.exit(1);
    }

    if (!CONFIG.smtpConfig.pass || CONFIG.smtpConfig.pass.includes('your-gmail-app-password')) {
        console.error('❌ Please set GMAIL_APP_PASSWORD in your .env file');
        process.exit(1);
    }

    await deployEmailTemplates();
    await verifyConfiguration();
}

// Run the deployment
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    deployEmailTemplates,
    verifyConfiguration,
    EMAIL_TEMPLATES,
    CONFIG
};

/**
 * Environment Variables (.env file):
 * 
 * SUPABASE_URL=https://your-project.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * GMAIL_APP_PASSWORD=your-gmail-app-password
 * SITE_URL=https://your-domain.com
 * 
 * To get Gmail App Password:
 * 1. Go to Google Account Settings
 * 2. Security > 2-Step Verification
 * 3. App passwords > Generate new password
 * 4. Select "Mail" and copy the generated password
 */