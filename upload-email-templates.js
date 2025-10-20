
/**
 * Automated Email Template Upload Script
 * =====================================
 * 
 * This script helps upload email templates to Supabase using the Management API
 * Note: Requires SUPABASE_SERVICE_ROLE_KEY for admin operations
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://hrkpbuenwejwspjrfgkd.supabase.co';
const PROJECT_REF = SUPABASE_URL.split('//')[1].split('.')[0];

// You need to set this environment variable
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function uploadEmailTemplates() {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.log('❌ SUPABASE_SERVICE_ROLE_KEY not set');
        console.log('💡 Get this from Supabase Dashboard → Settings → API');
        return false;
    }

    try {
        // Read email templates
        const signupTemplate = fs.readFileSync(
            path.join(__dirname, 'user-frontend', 'src', 'email-templates', 'neatrix-signup-confirmation.html'),
            'utf8'
        );
        
        const resetTemplate = fs.readFileSync(
            path.join(__dirname, 'user-frontend', 'src', 'email-templates', 'neatrix-password-reset.html'),
            'utf8'
        );

        // Upload signup confirmation template
        const signupResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mailer_templates_confirmation_content: signupTemplate,
                mailer_subjects_confirmation: 'Welcome to Neatrix! — Confirm your account'
            })
        });

        if (signupResponse.ok) {
            console.log('✅ Signup template uploaded successfully');
        } else {
            console.log('❌ Failed to upload signup template');
        }

        // Upload password reset template
        const resetResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mailer_templates_recovery_content: resetTemplate,
                mailer_subjects_recovery: 'Reset Your Neatrix Password'
            })
        });

        if (resetResponse.ok) {
            console.log('✅ Password reset template uploaded successfully');
        } else {
            console.log('❌ Failed to upload password reset template');
        }

        return signupResponse.ok && resetResponse.ok;
    } catch (error) {
        console.log(`❌ Upload error: ${error.message}`);
        return false;
    }
}

// Run upload if called directly
if (require.main === module) {
    uploadEmailTemplates().then(success => {
        if (success) {
            console.log('All templates uploaded successfully!');
        } else {
            console.log('Some templates failed to upload. Check the errors above.');
        }
    });
}

module.exports = { uploadEmailTemplates };
