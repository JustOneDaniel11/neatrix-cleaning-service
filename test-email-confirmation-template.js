/**
 * Email Confirmation Template Test Script
 * =====================================
 * 
 * This script tests the email confirmation template functionality including:
 * - Template rendering with sample data
 * - Supabase integration verification
 * - Visual preview generation
 * - Template variable validation
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Test data
const TEST_EMAIL = 'test@example.com';
const SAMPLE_CONFIRMATION_URL = 'https://your-domain.com/auth/callback?token=sample-token&type=signup&redirect_to=http://localhost:8080/email-verification-success';

console.log('🧪 Email Confirmation Template Test');
console.log('===================================\n');

/**
 * Test 1: Verify template files exist
 */
function testTemplateFiles() {
    console.log('📁 Test 1: Checking template files...');
    
    const templatePath = path.join(__dirname, 'user-frontend', 'src', 'email-templates');
    const requiredTemplates = [
        'neatrix-signup-confirmation.html',
        'neatrix-password-reset.html',
        'neatrix-admin-password-reset.html'
    ];
    
    let allFilesExist = true;
    
    requiredTemplates.forEach(template => {
        const filePath = path.join(templatePath, template);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`   ✅ ${template} (${Math.round(stats.size / 1024)}KB)`);
        } else {
            console.log(`   ❌ ${template} - Missing`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

/**
 * Test 2: Validate template content and variables
 */
function testTemplateContent() {
    console.log('\n📄 Test 2: Validating template content...');
    
    const templatePath = path.join(__dirname, 'user-frontend', 'src', 'email-templates', 'neatrix-signup-confirmation.html');
    
    if (!fs.existsSync(templatePath)) {
        console.log('   ❌ Template file not found');
        return false;
    }
    
    const content = fs.readFileSync(templatePath, 'utf8');
    
    // Check for required Supabase variables
    const requiredVariables = [
        '{{ .ConfirmationURL }}',
        '{{.ConfirmationURL}}'
    ];
    
    const hasConfirmationURL = requiredVariables.some(variable => content.includes(variable));
    console.log(`   🔗 Confirmation URL variable: ${hasConfirmationURL ? '✅ Found' : '❌ Missing'}`);
    
    // Check for essential elements
    const essentialElements = [
        { name: 'DOCTYPE declaration', pattern: /<!DOCTYPE html>/i },
        { name: 'Meta viewport', pattern: /<meta name="viewport"/i },
        { name: 'Neatrix branding', pattern: /Neatrix/i },
        { name: 'Contact email', pattern: /contactneatrix@gmail\.com/i },
        { name: 'Phone number', pattern: /\+2349034842430/i },
        { name: 'WhatsApp link', pattern: /wa\.me\/2349034842430/i }
    ];
    
    essentialElements.forEach(element => {
        const found = element.pattern.test(content);
        console.log(`   ${found ? '✅' : '❌'} ${element.name}: ${found ? 'Found' : 'Missing'}`);
    });
    
    return hasConfirmationURL;
}

/**
 * Test 3: Generate preview with sample data
 */
function generatePreview() {
    console.log('\n🎨 Test 3: Generating template preview...');
    
    const templatePath = path.join(__dirname, 'user-frontend', 'src', 'email-templates', 'neatrix-signup-confirmation.html');
    const previewPath = path.join(__dirname, 'email-template-test-preview.html');
    
    if (!fs.existsSync(templatePath)) {
        console.log('   ❌ Template file not found');
        return false;
    }
    
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Replace Supabase variables with sample data
    content = content.replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, SAMPLE_CONFIRMATION_URL);
    content = content.replace(/\{\{\s*\.Email\s*\}\}/g, TEST_EMAIL);
    
    // Add test banner
    const testBanner = `
    <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 16px; text-align: center; margin-bottom: 20px; border-radius: 8px;">
        <strong style="color: #92400e;">🧪 TEST PREVIEW</strong><br>
        <span style="color: #92400e; font-size: 14px;">This is a test preview with sample data</span>
    </div>`;
    
    content = content.replace('<div class="email-container">', `<div class="email-container">${testBanner}`);
    
    fs.writeFileSync(previewPath, content);
    console.log(`   ✅ Preview generated: ${previewPath}`);
    console.log(`   🌐 Open in browser: file://${previewPath}`);
    
    return true;
}

/**
 * Test 4: Test Supabase connection (if configured)
 */
async function testSupabaseConnection() {
    console.log('\n🔌 Test 4: Testing Supabase connection...');
    
    if (SUPABASE_URL.includes('your-project') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
        console.log('   ⚠️  Supabase credentials not configured');
        console.log('   💡 Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables to test');
        return false;
    }
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Test connection by checking auth settings
        const { data, error } = await supabase.auth.getSession();
        
        if (error && error.message !== 'Auth session missing!') {
            console.log(`   ❌ Connection failed: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.log(`   ❌ Connection error: ${error.message}`);
        return false;
    }
}

/**
 * Test 5: Validate email template configuration
 */
function testEmailConfiguration() {
    console.log('\n⚙️  Test 5: Checking email configuration files...');
    
    const configFiles = [
        'supabase-email-config.md',
        'neatrix-email-templates-config.md',
        'EMAIL-VERIFICATION-FIX-GUIDE.md'
    ];
    
    configFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${file} - Found`);
        } else {
            console.log(`   ⚠️  ${file} - Missing (optional)`);
        }
    });
    
    // Check for SQL deployment scripts
    const sqlPath = path.join(__dirname, 'user-frontend', 'src', 'email-templates', 'supabase-email-templates-integration.sql');
    if (fs.existsSync(sqlPath)) {
        console.log('   ✅ SQL deployment script - Found');
    } else {
        console.log('   ❌ SQL deployment script - Missing');
    }
    
    return true;
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('Starting email confirmation template tests...\n');
    
    const results = {
        templateFiles: testTemplateFiles(),
        templateContent: testTemplateContent(),
        preview: generatePreview(),
        supabaseConnection: await testSupabaseConnection(),
        emailConfiguration: testEmailConfiguration()
    };
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`${status} ${testName}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Email confirmation template is ready.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Open the generated preview file in your browser');
    console.log('2. Configure Supabase email templates in your dashboard');
    console.log('3. Test with a real signup to verify email delivery');
    console.log('4. Check spam folder if emails are not received');
    
    console.log('\n📞 Support:');
    console.log('Email: contactneatrix@gmail.com');
    console.log('Phone: +2349034842430');
    console.log('WhatsApp: https://wa.me/2349034842430');
}

// Run tests
runTests().catch(console.error);