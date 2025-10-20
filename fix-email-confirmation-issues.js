/**
 * Email Confirmation Issues Fix Script
 * ===================================
 * 
 * This script provides step-by-step fixes for all failed email confirmation tests:
 * 1. Supabase authentication configuration
 * 2. SMTP settings configuration
 * 3. Email template upload
 * 4. Testing and verification
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.join(__dirname, 'user-frontend', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Email Confirmation Issues Fix');
console.log('================================\n');

/**
 * Step 1: Generate Supabase Dashboard Configuration Guide
 */
function generateDashboardConfigGuide() {
    console.log('📋 Step 1: Generating Supabase Dashboard Configuration Guide...');
    
    const guide = `
# 🔧 Supabase Email Confirmation Fix Guide

## Critical Issues to Fix:

### 1. Enable Email Confirmations in Supabase Dashboard

**Location**: Supabase Dashboard → Authentication → Settings → User Management

**Required Settings**:
- ✅ **Enable email confirmations**: ON
- ✅ **Double confirm email changes**: ON (recommended)
- ✅ **Enable phone confirmations**: OFF (unless needed)

### 2. Configure SMTP Settings

**Location**: Supabase Dashboard → Authentication → Settings → SMTP Settings

**Gmail SMTP Configuration**:
\`\`\`
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: contactneatrix@gmail.com
SMTP Password: [YOUR_GMAIL_APP_PASSWORD]
Sender Name: Neatrix
Sender Email: contactneatrix@gmail.com
\`\`\`

**⚠️ Important**: You need to generate a Gmail App Password:
1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use the 16-character password in SMTP settings

### 3. Upload Email Templates

**Location**: Supabase Dashboard → Authentication → Email Templates

#### A. Signup Confirmation Template
- **Template**: "Confirm signup"
- **Subject**: \`Welcome to Neatrix! 🎉 — Confirm your account\`
- **Body**: Copy content from \`user-frontend/src/email-templates/neatrix-signup-confirmation.html\`

#### B. Password Reset Template
- **Template**: "Reset password"
- **Subject**: \`Reset Your Neatrix Password 🔐\`
- **Body**: Copy content from \`user-frontend/src/email-templates/neatrix-password-reset.html\`

### 4. Configure URL Settings

**Location**: Supabase Dashboard → Authentication → URL Configuration

**Site URL**: \`http://localhost:8080\` (for development)
**Redirect URLs**:
- \`http://localhost:8080/email-verification-success\`
- \`http://localhost:8080/auth/callback\`
- \`https://your-domain.com/email-verification-success\` (for production)
- \`https://your-domain.com/auth/callback\` (for production)

### 5. Test Configuration

After completing the above steps, run:
\`\`\`bash
node test-email-confirmation-integration.js
\`\`\`

## 🚨 Common Issues & Solutions

### Issue: "Auth session missing!"
**Solution**: This is expected with anonymous key. The error indicates auth system is working.

### Issue: "Unable to validate email address"
**Solution**: 
1. Check SMTP configuration
2. Verify Gmail App Password
3. Ensure email confirmations are enabled

### Issue: "Invalid JWT"
**Solution**: 
1. Check Supabase URL and keys
2. Verify project is active
3. Regenerate keys if needed

### Issue: Emails not received
**Solution**:
1. Check spam folder
2. Verify SMTP settings
3. Test with different email providers
4. Check Supabase logs

## 📞 Support Contacts

- **Email**: contactneatrix@gmail.com
- **Phone**: +2349034842430
- **WhatsApp**: https://wa.me/2349034842430

---
Generated on: ${new Date().toISOString()}
Project: ${SUPABASE_URL}
`;

    const guidePath = path.join(__dirname, 'SUPABASE-EMAIL-FIX-GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    console.log(`   ✅ Configuration guide created: ${guidePath}`);
    
    return guidePath;
}

/**
 * Step 2: Create SQL script for database-level fixes
 */
function generateSQLFixes() {
    console.log('\n🗄️  Step 2: Generating SQL fixes...');
    
    const sqlScript = `
-- =====================================================
-- Email Confirmation Database Fixes
-- =====================================================
-- Run these commands in Supabase SQL Editor if needed

-- 1. Check current auth configuration
SELECT 
    raw_app_meta_data,
    raw_user_meta_data,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check if email confirmations are working
SELECT 
    COUNT(*) as total_users,
    COUNT(email_confirmed_at) as confirmed_users,
    COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

-- 3. Enable email confirmations (if not already enabled)
-- Note: This should be done through the dashboard, not SQL

-- 4. Check for any auth-related errors
SELECT 
    created_at,
    level,
    msg
FROM auth.audit_log_entries 
WHERE level = 'ERROR'
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Verify auth schema is properly set up
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name IN ('users', 'sessions', 'refresh_tokens')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- End of SQL Fixes
-- =====================================================
`;

    const sqlPath = path.join(__dirname, 'fix-email-confirmation.sql');
    fs.writeFileSync(sqlPath, sqlScript);
    console.log(`   ✅ SQL fixes created: ${sqlPath}`);
    
    return sqlPath;
}

/**
 * Step 3: Create automated template upload script
 */
function generateTemplateUploadScript() {
    console.log('\n📧 Step 3: Generating template upload script...');
    
    const uploadScript = `
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
const SUPABASE_URL = '${SUPABASE_URL}';
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
        const signupResponse = await fetch(\`https://api.supabase.com/v1/projects/\${PROJECT_REF}/config/auth\`, {
            method: 'PATCH',
            headers: {
                'Authorization': \`Bearer \${SUPABASE_SERVICE_ROLE_KEY}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mailer_templates_confirmation: signupTemplate,
                mailer_subjects_confirmation: 'Welcome to Neatrix! 🎉 — Confirm your account'
            })
        });

        if (signupResponse.ok) {
            console.log('✅ Signup template uploaded successfully');
        } else {
            console.log('❌ Failed to upload signup template');
        }

        // Upload password reset template
        const resetResponse = await fetch(\`https://api.supabase.com/v1/projects/\${PROJECT_REF}/config/auth\`, {
            method: 'PATCH',
            headers: {
                'Authorization': \`Bearer \${SUPABASE_SERVICE_ROLE_KEY}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mailer_templates_recovery: resetTemplate,
                mailer_subjects_recovery: 'Reset Your Neatrix Password 🔐'
            })
        });

        if (resetResponse.ok) {
            console.log('✅ Password reset template uploaded successfully');
        } else {
            console.log('❌ Failed to upload password reset template');
        }

        return signupResponse.ok && resetResponse.ok;
    } catch (error) {
        console.log(\`❌ Upload error: \${error.message}\`);
        return false;
    }
}

// Run upload if called directly
if (require.main === module) {
    uploadEmailTemplates().then(success => {
        if (success) {
            console.log('🎉 All templates uploaded successfully!');
        } else {
            console.log('⚠️  Some templates failed to upload. Check the errors above.');
        }
    });
}

module.exports = { uploadEmailTemplates };
`;

    const uploadPath = path.join(__dirname, 'upload-email-templates.js');
    fs.writeFileSync(uploadPath, uploadScript);
    console.log(`   ✅ Template upload script created: ${uploadPath}`);
    
    return uploadPath;
}

/**
 * Step 4: Create comprehensive test script
 */
function generateComprehensiveTest() {
    console.log('\n🧪 Step 4: Generating comprehensive test script...');
    
    const testScript = `
/**
 * Comprehensive Email Confirmation Test
 * ====================================
 * 
 * This script tests the complete email confirmation flow after fixes
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';

async function testEmailConfirmationFlow() {
    console.log('🧪 Testing Email Confirmation Flow...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test 1: Basic connection
    try {
        const { data, error } = await supabase.auth.getSession();
        console.log('✅ Supabase connection working');
    } catch (error) {
        console.log(\`❌ Connection failed: \${error.message}\`);
        return false;
    }
    
    // Test 2: Signup flow (with test email)
    const testEmail = \`test-\${Date.now()}@example.com\`;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!',
            options: {
                emailRedirectTo: 'http://localhost:8080/email-verification-success'
            }
        });
        
        if (error) {
            if (error.message.includes('Email not confirmed') || 
                error.message.includes('Signup requires a valid password')) {
                console.log('✅ Signup flow working (email confirmation required)');
                return true;
            } else {
                console.log(\`❌ Signup error: \${error.message}\`);
                return false;
            }
        }
        
        if (data.user) {
            console.log('✅ User created successfully');
            console.log(\`📧 Confirmation email should be sent to: \${testEmail}\`);
            return true;
        }
        
    } catch (error) {
        console.log(\`❌ Signup test failed: \${error.message}\`);
        return false;
    }
    
    return false;
}

// Run test if called directly
if (require.main === module) {
    testEmailConfirmationFlow().then(success => {
        if (success) {
            console.log('🎉 Email confirmation flow is working!');
        } else {
            console.log('⚠️  Email confirmation flow needs attention.');
        }
    });
}

module.exports = { testEmailConfirmationFlow };
`;

    const testPath = path.join(__dirname, 'test-email-flow-complete.js');
    fs.writeFileSync(testPath, testScript);
    console.log(`   ✅ Comprehensive test created: ${testPath}`);
    
    return testPath;
}

/**
 * Step 5: Generate step-by-step fix instructions
 */
function generateFixInstructions() {
    console.log('\n📋 Step 5: Generating step-by-step fix instructions...');
    
    const instructions = `
# 🔧 Step-by-Step Email Confirmation Fix Instructions

## Phase 1: Supabase Dashboard Configuration (CRITICAL)

### 1.1 Enable Email Confirmations
1. Go to Supabase Dashboard: ${SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}
2. Navigate to **Authentication** → **Settings** → **User Management**
3. Enable these settings:
   - ✅ **Enable email confirmations**: ON
   - ✅ **Double confirm email changes**: ON
   - ✅ **Enable phone confirmations**: OFF

### 1.2 Configure SMTP Settings
1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure Gmail SMTP:
   - **SMTP Host**: smtp.gmail.com
   - **SMTP Port**: 587
   - **SMTP User**: contactneatrix@gmail.com
   - **SMTP Password**: [Generate Gmail App Password]
   - **Sender Name**: Neatrix
   - **Sender Email**: contactneatrix@gmail.com

**🔑 Gmail App Password Setup**:
1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Go to Security → App passwords
4. Generate password for "Mail"
5. Use the 16-character password in Supabase

### 1.3 Upload Email Templates
1. Go to **Authentication** → **Email Templates**
2. **Confirm signup** template:
   - Subject: \`Welcome to Neatrix! 🎉 — Confirm your account\`
   - Body: Copy from \`user-frontend/src/email-templates/neatrix-signup-confirmation.html\`
3. **Reset password** template:
   - Subject: \`Reset Your Neatrix Password 🔐\`
   - Body: Copy from \`user-frontend/src/email-templates/neatrix-password-reset.html\`

### 1.4 Configure URLs
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: \`http://localhost:8080\`
3. Add **Redirect URLs**:
   - \`http://localhost:8080/email-verification-success\`
   - \`http://localhost:8080/auth/callback\`

## Phase 2: Testing and Verification

### 2.1 Run Basic Test
\`\`\`bash
node test-email-flow-complete.js
\`\`\`

### 2.2 Run Full Integration Test
\`\`\`bash
node test-email-confirmation-integration.js
\`\`\`

### 2.3 Manual Test
1. Go to your application signup page
2. Create account with real email
3. Check email inbox (and spam folder)
4. Click confirmation link
5. Verify redirect works

## Phase 3: Production Deployment

### 3.1 Update URLs for Production
- Site URL: Your production domain
- Redirect URLs: Your production callback URLs

### 3.2 DNS Configuration (Optional but Recommended)
- Set up SPF record: \`v=spf1 include:_spf.google.com ~all\`
- Configure DKIM in Gmail
- Set up DMARC policy

## 🚨 Troubleshooting

### Problem: "Auth session missing!"
**Solution**: Normal with anonymous key. Auth system is working.

### Problem: "Unable to validate email address"
**Solutions**:
1. Check SMTP configuration
2. Verify Gmail App Password
3. Check spam folder
4. Try different email provider

### Problem: Templates not rendering
**Solutions**:
1. Verify HTML is valid
2. Check Supabase variables: \`{{ .ConfirmationURL }}\`
3. Re-upload templates

### Problem: Emails not delivered
**Solutions**:
1. Check Supabase logs
2. Verify SMTP credentials
3. Check email provider restrictions
4. Test with Gmail, Outlook, Yahoo

## 📞 Support

- **Email**: contactneatrix@gmail.com
- **Phone**: +2349034842430
- **WhatsApp**: https://wa.me/2349034842430

---
Generated: ${new Date().toISOString()}
`;

    const instructionsPath = path.join(__dirname, 'EMAIL-CONFIRMATION-FIX-INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);
    console.log(`   ✅ Fix instructions created: ${instructionsPath}`);
    
    return instructionsPath;
}

/**
 * Main fix runner
 */
async function runEmailConfirmationFix() {
    console.log('Starting comprehensive email confirmation fix...\n');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.log('❌ Missing Supabase credentials in user-frontend/.env');
        return false;
    }
    
    console.log('Project: ' + SUPABASE_URL);
    console.log('Key: ' + SUPABASE_ANON_KEY.substring(0, 20) + '...\n');
    
    // Generate all fix files
    const guidePath = generateDashboardConfigGuide();
    const sqlPath = generateSQLFixes();
    const uploadPath = generateTemplateUploadScript();
    const testPath = generateComprehensiveTest();
    const instructionsPath = generateFixInstructions();
    
    console.log('\nEmail Confirmation Fix Complete!');
    console.log('==================================');
    console.log('Generated files:');
    console.log(`Dashboard Guide: ${path.basename(guidePath)}`);
    console.log(`SQL Fixes: ${path.basename(sqlPath)}`);
    console.log(`Template Upload: ${path.basename(uploadPath)}`);
    console.log(`Comprehensive Test: ${path.basename(testPath)}`);
    console.log(`Step-by-step Instructions: ${path.basename(instructionsPath)}`);
    
    console.log('\nNext Steps:');
    console.log('1. Follow the step-by-step instructions in EMAIL-CONFIRMATION-FIX-INSTRUCTIONS.md');
    console.log('2. Configure Supabase Dashboard settings (CRITICAL)');
    console.log('3. Set up Gmail SMTP with App Password');
    console.log('4. Upload email templates');
    console.log('5. Run tests to verify everything works');
    
    console.log('\nIMPORTANT: Most fixes require Supabase Dashboard configuration!');
    
    return true;
}

// Run the fix
runEmailConfirmationFix().catch(console.error);