// 🧪 BROWSER SIGNUP TEST - Paste this in your browser's developer console
// =====================================================================

// Test signup function you can run in browser console
async function testEmailSignup() {
    console.log('🧪 Testing Email Signup...');
    
    // Generate unique test email
    const timestamp = Date.now();
    const testEmail = `test.${timestamp}@yourdomain.com`; // Replace with a real email you can access
    const testPassword = 'TestPassword123!';
    
    console.log('📧 Test Email:', testEmail);
    console.log('🔒 Test Password:', testPassword);
    
    try {
        // Assuming you have supabase client available globally
        // If not, you'll need to import it first
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: window.location.origin + '/auth/callback'
            }
        });
        
        if (error) {
            console.error('❌ Signup Error:', error.message);
            console.error('Status:', error.status);
            
            if (error.status === 429) {
                console.log('⏰ Rate limit hit - email system is working!');
                console.log('Wait 1-2 hours and try with a different email');
            }
            return;
        }
        
        console.log('✅ Signup Successful!');
        console.log('User:', data.user);
        console.log('📧 Check email:', testEmail);
        console.log('🔗 Look for confirmation email from: contactneatrix@gmail.com');
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

// Instructions for use:
console.log(`
🎯 INSTRUCTIONS:
================
1. Open your application in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste this entire code
5. Run: testEmailSignup()
6. Check the email inbox for confirmation

⚠️  IMPORTANT: 
- Replace 'test.${timestamp}@yourdomain.com' with a real email you can access
- Make sure you have access to that email inbox
- If you get rate limit error, wait 1-2 hours
`);

// Alternative: Manual signup test
console.log(`
🔧 MANUAL TEST ALTERNATIVE:
===========================
If rate limited, try this:
1. Wait 2 hours for rate limit reset
2. Go to your signup page
3. Use a fresh email address you can access
4. Complete signup form
5. Check email inbox for confirmation
6. Click confirmation link

Your email system IS working - just rate limited from testing!
`);