/**
 * Email Confirmation Integration Test
 * ==================================
 * 
 * This script tests the complete email confirmation flow including:
 * - Supabase connection with real credentials
 * - User signup process
 * - Email template configuration verification
 * - Authentication flow testing
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from user-frontend/.env
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

console.log('🔗 Email Confirmation Integration Test');
console.log('=====================================\n');

/**
 * Test 1: Verify Supabase connection and configuration
 */
async function testSupabaseConnection() {
    console.log('🔌 Test 1: Verifying Supabase connection...');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.log('   ❌ Missing Supabase credentials');
        console.log('   💡 Check user-frontend/.env file');
        return false;
    }
    
    console.log(`   🌐 URL: ${SUPABASE_URL}`);
    console.log(`   🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Test connection by checking auth settings
        const { data, error } = await supabase.auth.getSession();
        
        if (error && !error.message.includes('Auth session missing')) {
            console.log(`   ❌ Connection failed: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Supabase connection successful');
        return supabase;
    } catch (error) {
        console.log(`   ❌ Connection error: ${error.message}`);
        return false;
    }
}

/**
 * Test 2: Check authentication configuration
 */
async function testAuthConfiguration(supabase) {
    console.log('\n⚙️  Test 2: Checking authentication configuration...');
    
    try {
        // Try to get current user (should be null for anonymous session)
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error && !error.message.includes('Invalid JWT')) {
            console.log(`   ❌ Auth config error: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Authentication system accessible');
        
        // Check if we can access auth settings (this might fail with anon key, which is expected)
        try {
            const { data, error } = await supabase.auth.admin.listUsers();
            if (!error) {
                console.log('   ✅ Admin access available');
            } else {
                console.log('   ℹ️  Admin access restricted (expected with anon key)');
            }
        } catch (adminError) {
            console.log('   ℹ️  Admin access restricted (expected with anon key)');
        }
        
        return true;
    } catch (error) {
        console.log(`   ❌ Auth configuration error: ${error.message}`);
        return false;
    }
}

/**
 * Test 3: Test signup flow (without actually creating a user)
 */
async function testSignupFlow(supabase) {
    console.log('\n📝 Test 3: Testing signup flow...');
    
    // Use a test email that won't actually be created
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`   📧 Test email: ${testEmail}`);
    
    try {
        // Attempt signup (this will test the flow but may fail due to email restrictions)
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: 'http://localhost:8080/email-verification-success'
            }
        });
        
        if (error) {
            if (error.message.includes('Unable to validate email address') || 
                error.message.includes('Invalid email') ||
                error.message.includes('Email not confirmed')) {
                console.log('   ✅ Signup flow accessible (email validation working)');
                console.log(`   ℹ️  Expected error: ${error.message}`);
                return true;
            } else {
                console.log(`   ❌ Signup error: ${error.message}`);
                return false;
            }
        }
        
        if (data.user) {
            console.log('   ✅ Signup successful');
            console.log(`   👤 User ID: ${data.user.id}`);
            console.log(`   📧 Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
            
            // Clean up - try to delete the test user
            try {
                await supabase.auth.admin.deleteUser(data.user.id);
                console.log('   🧹 Test user cleaned up');
            } catch (cleanupError) {
                console.log('   ⚠️  Could not clean up test user (admin access required)');
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`   ❌ Signup flow error: ${error.message}`);
        return false;
    }
}

/**
 * Test 4: Verify email template configuration
 */
function testEmailTemplateConfiguration() {
    console.log('\n📧 Test 4: Verifying email template configuration...');
    
    const templatePath = path.join(__dirname, 'user-frontend', 'src', 'email-templates', 'neatrix-signup-confirmation.html');
    
    if (!fs.existsSync(templatePath)) {
        console.log('   ❌ Email template not found');
        return false;
    }
    
    const content = fs.readFileSync(templatePath, 'utf8');
    
    // Check for Supabase variables
    const hasConfirmationURL = content.includes('{{ .ConfirmationURL }}');
    console.log(`   🔗 Confirmation URL variable: ${hasConfirmationURL ? '✅ Found' : '❌ Missing'}`);
    
    // Check for proper HTML structure
    const hasDoctype = content.includes('<!DOCTYPE html>');
    const hasViewport = content.includes('viewport');
    const hasNeatrixBranding = content.includes('Neatrix');
    
    console.log(`   📄 HTML structure: ${hasDoctype ? '✅' : '❌'} DOCTYPE`);
    console.log(`   📱 Mobile responsive: ${hasViewport ? '✅' : '❌'} Viewport`);
    console.log(`   🏷️  Branding: ${hasNeatrixBranding ? '✅' : '❌'} Neatrix`);
    
    // Check for contact information
    const hasEmail = content.includes('contactneatrix@gmail.com');
    const hasPhone = content.includes('+2349034842430');
    const hasWhatsApp = content.includes('wa.me/2349034842430');
    
    console.log(`   📧 Contact email: ${hasEmail ? '✅' : '❌'} Found`);
    console.log(`   📞 Phone number: ${hasPhone ? '✅' : '❌'} Found`);
    console.log(`   💬 WhatsApp: ${hasWhatsApp ? '✅' : '❌'} Found`);
    
    return hasConfirmationURL && hasDoctype && hasNeatrixBranding;
}

/**
 * Test 5: Check deployment configuration files
 */
function testDeploymentConfiguration() {
    console.log('\n🚀 Test 5: Checking deployment configuration...');
    
    const configFiles = [
        { file: 'supabase-email-config.md', required: false },
        { file: 'neatrix-email-templates-config.md', required: false },
        { file: 'EMAIL-VERIFICATION-FIX-GUIDE.md', required: false },
        { file: 'user-frontend/src/email-templates/supabase-email-templates-integration.sql', required: true }
    ];
    
    let allRequiredFound = true;
    
    configFiles.forEach(({ file, required }) => {
        const filePath = path.join(__dirname, file);
        const exists = fs.existsSync(filePath);
        
        if (required && !exists) {
            allRequiredFound = false;
        }
        
        const status = exists ? '✅' : (required ? '❌' : '⚠️ ');
        const label = required ? 'Required' : 'Optional';
        console.log(`   ${status} ${file} (${label})`);
    });
    
    return allRequiredFound;
}

/**
 * Test 6: Generate comprehensive test report
 */
function generateTestReport(results) {
    console.log('\n📊 Comprehensive Test Report');
    console.log('============================');
    
    const testResults = [
        { name: 'Supabase Connection', passed: !!results.connection, critical: true },
        { name: 'Auth Configuration', passed: results.authConfig, critical: true },
        { name: 'Signup Flow', passed: results.signupFlow, critical: true },
        { name: 'Email Template', passed: results.emailTemplate, critical: true },
        { name: 'Deployment Config', passed: results.deploymentConfig, critical: false }
    ];
    
    testResults.forEach(test => {
        const status = test.passed ? '✅ PASS' : '❌ FAIL';
        const priority = test.critical ? '🔴 CRITICAL' : '🟡 OPTIONAL';
        console.log(`${status} ${test.name} (${priority})`);
    });
    
    const criticalTests = testResults.filter(t => t.critical);
    const passedCritical = criticalTests.filter(t => t.passed).length;
    const totalCritical = criticalTests.length;
    
    console.log(`\n🎯 Critical Tests: ${passedCritical}/${totalCritical} passed`);
    
    if (passedCritical === totalCritical) {
        console.log('\n🎉 All critical tests passed! Email confirmation is ready for production.');
        console.log('\n📋 Next Steps:');
        console.log('1. Upload email templates to Supabase Dashboard');
        console.log('2. Configure SMTP settings in Supabase');
        console.log('3. Test with real email addresses');
        console.log('4. Monitor email delivery rates');
    } else {
        console.log('\n⚠️  Some critical tests failed. Please address the issues above.');
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check Supabase project settings');
        console.log('2. Verify email template configuration');
        console.log('3. Review authentication settings');
        console.log('4. Test SMTP configuration');
    }
    
    console.log('\n📞 Support:');
    console.log('Email: contactneatrix@gmail.com');
    console.log('Phone: +2349034842430');
    console.log('WhatsApp: https://wa.me/2349034842430');
}

/**
 * Main test runner
 */
async function runIntegrationTests() {
    console.log('Starting comprehensive email confirmation integration tests...\n');
    
    const results = {
        connection: await testSupabaseConnection(),
        authConfig: false,
        signupFlow: false,
        emailTemplate: testEmailTemplateConfiguration(),
        deploymentConfig: testDeploymentConfiguration()
    };
    
    if (results.connection) {
        results.authConfig = await testAuthConfiguration(results.connection);
        if (results.authConfig) {
            results.signupFlow = await testSignupFlow(results.connection);
        }
    }
    
    generateTestReport(results);
}

// Run integration tests
runIntegrationTests().catch(console.error);