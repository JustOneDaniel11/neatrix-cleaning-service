-- =====================================================
-- Neatrix Email Templates Integration for Supabase
-- =====================================================
-- This SQL script configures custom email templates for Supabase Auth
-- Run these commands in your Supabase SQL Editor or via API
-- 
-- Prerequisites:
-- 1. Supabase project with Auth enabled
-- 2. Admin access to SQL Editor
-- 3. SMTP configuration (see configuration guide)
--
-- Contact Information:
-- Email: contactneatrix@gmail.com
-- Phone: +2349034842430
-- WhatsApp: https://wa.me/2349034842430
-- =====================================================

-- =====================================================
-- 1. UPDATE SIGNUP CONFIRMATION EMAIL TEMPLATE
-- =====================================================

-- Update the signup confirmation email template
UPDATE auth.config 
SET 
    email_template = '{
        "subject": "Welcome to Neatrix! 🎉 — Confirm your account",
        "body": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Welcome to Neatrix! 🎉 — Confirm your account</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:''Inter'',-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f8fafc;line-height:1.6;color:#334155;padding:20px 0}.email-container{max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);color:white;padding:40px 30px;text-align:center;position:relative}.header::before{content:'''';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#a855f7,#ec4899,#6a1b9a)}.logo-container{display:flex;align-items:center;justify-content:center;margin-bottom:20px}.logo{width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;margin-right:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.3)}.brand-text{font-size:28px;font-weight:700;color:white}.header h1{font-size:28px;font-weight:700;margin-bottom:8px}.header p{font-size:16px;opacity:0.9;font-weight:400}.content{padding:40px 30px}.welcome-title{font-size:24px;font-weight:700;color:#1e293b;margin-bottom:16px;text-align:center}.welcome-message{font-size:16px;color:#475569;margin-bottom:32px;text-align:center;line-height:1.7}.cta-container{text-align:center;margin:32px 0}.cta-button{display:inline-block;background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(106,27,154,0.3);position:relative;overflow:hidden}.cta-button::before{content:'''';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent);transition:left 0.5s}.cta-button:hover::before{left:100%}.cta-button:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(106,27,154,0.4)}.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;margin:40px 0;padding:30px 20px;background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border-radius:12px;border:1px solid #e2e8f0}.feature{text-align:center;padding:20px 10px}.feature-icon{width:60px;height:60px;background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px}.feature h3{font-size:16px;font-weight:600;color:#1e293b;margin-bottom:8px}.feature p{font-size:14px;color:#64748b;line-height:1.5}.next-steps{background:#fefbff;border:1px solid #e9d5ff;border-radius:12px;padding:24px;margin:32px 0}.next-steps h3{font-size:18px;font-weight:600;color:#6a1b9a;margin-bottom:16px;text-align:center}.steps-list{display:grid;gap:12px}.step-item{display:flex;align-items:flex-start;gap:12px;font-size:14px;color:#475569}.step-number{width:24px;height:24px;background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;flex-shrink:0}.alternative-link{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0;font-size:14px;color:#64748b;text-align:center}.alternative-link strong{color:#1e293b}.alternative-link code{background:#e2e8f0;padding:2px 6px;border-radius:4px;font-family:''Monaco'',''Menlo'',monospace;font-size:13px;color:#6a1b9a;word-break:break-all}.footer{background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0}.footer-content{font-size:14px;color:#64748b;line-height:1.6}.footer-content strong{color:#1e293b}.support-links{margin-top:16px;display:flex;justify-content:center;gap:20px;flex-wrap:wrap}.support-link{color:#6a1b9a;text-decoration:none;font-weight:500;font-size:14px}.support-link:hover{text-decoration:underline}.divider{height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:24px 0}@media (max-width:600px){body{padding:10px 0}.email-container{margin:0 10px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}.header,.content,.footer{padding:24px 20px}.header h1{font-size:24px;line-height:1.3}.header p{font-size:14px}.welcome-title{font-size:22px;line-height:1.3}.message{font-size:15px;line-height:1.6}.features{grid-template-columns:1fr;padding:20px 15px;gap:16px}.feature{padding:16px}.feature h3{font-size:16px;margin-bottom:8px}.feature p{font-size:14px;line-height:1.5}.cta-button{padding:16px 28px;font-size:16px;width:100%;max-width:280px;display:block;text-align:center}.next-steps{padding:20px 15px}.next-steps h3{font-size:18px}.next-steps ul li{font-size:14px;line-height:1.5;margin-bottom:8px}.support-links{flex-direction:column;gap:12px}.support-link{font-size:15px;padding:8px 0}.logo{width:50px;height:50px;font-size:20px}.brand-text{font-size:24px}}</style></head><body><div class=\"email-container\"><div class=\"header\"><div class=\"logo-container\"><div class=\"logo\">N</div><div class=\"brand-text\">Neatrix</div></div><h1>Welcome aboard! 🎉</h1><p>Your cleaning service journey starts here</p></div><div class=\"content\"><div class=\"welcome-title\">Thanks for joining Neatrix!</div><div class=\"welcome-message\">We''re excited to have you as part of our community. To get started with our premium cleaning services, please confirm your email address by clicking the button below.</div><div class=\"cta-container\"><a href=\"{{ .ConfirmationURL }}\" class=\"cta-button\">Confirm My Email</a></div><div class=\"features\"><div class=\"feature\"><div class=\"feature-icon\">🏠</div><h3>House Cleaning</h3><p>Professional home cleaning services tailored to your needs</p></div><div class=\"feature\"><div class=\"feature-icon\">🏢</div><h3>Office Cleaning</h3><p>Keep your workspace spotless and productive</p></div><div class=\"feature\"><div class=\"feature-icon\">🎓</div><h3>School Cleaning</h3><p>Safe and thorough cleaning for educational facilities</p></div></div><div class=\"next-steps\"><h3>What''s Next?</h3><div class=\"steps-list\"><div class=\"step-item\"><div class=\"step-number\">1</div><span>Confirm your email address using the button above</span></div><div class=\"step-item\"><div class=\"step-number\">2</div><span>Complete your profile and preferences</span></div><div class=\"step-item\"><div class=\"step-number\">3</div><span>Browse our services and book your first cleaning</span></div><div class=\"step-item\"><div class=\"step-number\">4</div><span>Enjoy a spotless space with our professional team</span></div></div></div><div class=\"alternative-link\"><strong>Button not working?</strong> Copy and paste this link into your browser:<br><code>{{ .ConfirmationURL }}</code></div><div class=\"divider\"></div><div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;text-align:center\"><div style=\"color:#0369a1;font-weight:600;margin-bottom:8px\">🔒 Security Note</div><div style=\"color:#0c4a6e;font-size:14px;line-height:1.5\">This confirmation link will expire in 24 hours for your security. If you didn''t create this account, you can safely ignore this email.</div></div></div><div class=\"footer\"><div class=\"footer-content\"><strong>Need help?</strong> Contact contactneatrix@gmail.com<br>We''re here to help you get the most out of Neatrix.</div><div class=\"support-links\"><a href=\"mailto:contactneatrix@gmail.com\" class=\"support-link\">contactneatrix@gmail.com</a><a href=\"tel:+2349034842430\" class=\"support-link\">📞 +2349034842430</a><a href=\"https://wa.me/2349034842430\" class=\"support-link\">WhatsApp Support</a></div></div></div></body></html>"
    }'
WHERE template_name = 'confirmation';

-- =====================================================
-- 2. UPDATE PASSWORD RESET EMAIL TEMPLATE
-- =====================================================

-- Update the password reset email template
UPDATE auth.config 
SET 
    email_template = '{
        "subject": "Reset Your Neatrix Password 🔐",
        "body": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Reset Your Neatrix Password 🔐</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:''Inter'',-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f8fafc;line-height:1.6;color:#334155;padding:20px 0}.email-container{max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);color:white;padding:40px 30px;text-align:center;position:relative}.header::before{content:'''';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#a855f7,#ec4899,#6a1b9a)}.logo-container{display:flex;align-items:center;justify-content:center;margin-bottom:20px}.logo{width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;margin-right:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.3)}.brand-text{font-size:28px;font-weight:700;color:white}.header h1{font-size:28px;font-weight:700;margin-bottom:8px}.header p{font-size:16px;opacity:0.9;font-weight:400}.content{padding:40px 30px}.reset-title{font-size:24px;font-weight:700;color:#1e293b;margin-bottom:16px;text-align:center}.reset-message{font-size:16px;color:#475569;margin-bottom:32px;text-align:center;line-height:1.7}.cta-container{text-align:center;margin:32px 0}.cta-button{display:inline-block;background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(106,27,154,0.3);position:relative;overflow:hidden}.cta-button::before{content:'''';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent);transition:left 0.5s}.cta-button:hover::before{left:100%}.cta-button:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(106,27,154,0.4)}.security-features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin:40px 0;padding:30px 20px;background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border-radius:12px;border:1px solid #e2e8f0}.security-feature{text-align:center;padding:20px 10px}.security-icon{width:60px;height:60px;background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px}.security-feature h3{font-size:16px;font-weight:600;color:#1e293b;margin-bottom:8px}.security-feature p{font-size:14px;color:#64748b;line-height:1.5}.reset-steps{background:#fefbff;border:1px solid #e9d5ff;border-radius:12px;padding:24px;margin:32px 0}.reset-steps h3{font-size:18px;font-weight:600;color:#6a1b9a;margin-bottom:16px;text-align:center}.steps-list{display:grid;gap:12px}.step-item{display:flex;align-items:flex-start;gap:12px;font-size:14px;color:#475569}.step-number{width:24px;height:24px;background:linear-gradient(135deg,#6a1b9a 0%,#8e24aa 100%);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;flex-shrink:0}.alternative-link{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0;font-size:14px;color:#64748b;text-align:center}.alternative-link strong{color:#1e293b}.alternative-link code{background:#e2e8f0;padding:2px 6px;border-radius:4px;font-family:''Monaco'',''Menlo'',monospace;font-size:13px;color:#6a1b9a;word-break:break-all}.footer{background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0}.footer-content{font-size:14px;color:#64748b;line-height:1.6}.footer-content strong{color:#1e293b}.support-links{margin-top:16px;display:flex;justify-content:center;gap:20px;flex-wrap:wrap}.support-link{color:#6a1b9a;text-decoration:none;font-weight:500;font-size:14px}.support-link:hover{text-decoration:underline}.divider{height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:24px 0}.expiry-notice{background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:24px 0;text-align:center}.expiry-notice .icon{font-size:20px;margin-bottom:8px}.expiry-notice .title{color:#92400e;font-weight:600;margin-bottom:8px}.expiry-notice .text{color:#b45309;font-size:14px;line-height:1.5}@media (max-width:600px){body{padding:10px 0}.email-container{margin:0 10px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}.header,.content,.footer{padding:24px 20px}.header h1{font-size:24px;line-height:1.3}.header p{font-size:14px}.reset-title{font-size:22px;line-height:1.3}.message{font-size:15px;line-height:1.6}.security-features{grid-template-columns:1fr;padding:20px 15px;gap:16px}.security-feature{padding:16px}.security-feature h3{font-size:16px;margin-bottom:8px}.security-feature p{font-size:14px;line-height:1.5}.cta-button{padding:16px 28px;font-size:16px;width:100%;max-width:280px;display:block;text-align:center}.instructions{padding:20px 15px}.instructions h3{font-size:18px}.instructions ol li{font-size:14px;line-height:1.5;margin-bottom:8px}.support-links{flex-direction:column;gap:12px}.support-link{font-size:15px;padding:8px 0}.logo{width:50px;height:50px;font-size:20px}.brand-text{font-size:24px}}</style></head><body><div class=\"email-container\"><div class=\"header\"><div class=\"logo-container\"><div class=\"logo\">N</div><div class=\"brand-text\">Neatrix</div></div><h1>Password Reset Request 🔐</h1><p>Let''s get you back into your account</p></div><div class=\"content\"><div class=\"reset-title\">Reset Your Password</div><div class=\"reset-message\">No worries! It happens to the best of us. Click the button below to create a new password for your Neatrix account and get back to booking amazing cleaning services.</div><div class=\"cta-container\"><a href=\"{{ .ConfirmationURL }}\" class=\"cta-button\">Reset My Password</a></div><div class=\"security-features\"><div class=\"security-feature\"><div class=\"security-icon\">🔒</div><h3>Secure Process</h3><p>Your password reset is protected with enterprise-grade security</p></div><div class=\"security-feature\"><div class=\"security-icon\">⏰</div><h3>Time Limited</h3><p>This link expires in 1 hour for your account protection</p></div></div><div class=\"reset-steps\"><h3>How to Reset Your Password</h3><div class=\"steps-list\"><div class=\"step-item\"><div class=\"step-number\">1</div><span>Click the \"Reset My Password\" button above</span></div><div class=\"step-item\"><div class=\"step-number\">2</div><span>You''ll be taken to a secure password reset page</span></div><div class=\"step-item\"><div class=\"step-number\">3</div><span>Enter your new password (make it strong!)</span></div><div class=\"step-item\"><div class=\"step-number\">4</div><span>Log in with your new password and continue cleaning</span></div></div></div><div class=\"expiry-notice\"><div class=\"icon\">⏳</div><div class=\"title\">Important: Link Expires Soon</div><div class=\"text\">This password reset link will expire in 1 hour for security reasons. If you need a new link, just request another password reset from the login page.</div></div><div class=\"alternative-link\"><strong>Button not working?</strong> Copy and paste this link into your browser:<br><code>{{ .ConfirmationURL }}</code></div><div class=\"divider\"></div><div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;text-align:center\"><div style=\"color:#0369a1;font-weight:600;margin-bottom:8px\">🛡️ Security Notice</div><div style=\"color:#0c4a6e;font-size:14px;line-height:1.5\">If you didn''t request this password reset, please ignore this email. Your account remains secure. Consider changing your password if you suspect unauthorized access.</div></div></div><div class=\"footer\"><div class=\"footer-content\"><strong>Need help?</strong> Contact contactneatrix@gmail.com<br>We''re here to help you get back to your clean, organized life.</div><div class=\"support-links\"><a href=\"mailto:contactneatrix@gmail.com\" class=\"support-link\">contactneatrix@gmail.com</a><a href=\"tel:+2349034842430\" class=\"support-link\">📞 +2349034842430</a><a href=\"https://wa.me/2349034842430\" class=\"support-link\">WhatsApp Support</a></div></div></div></body></html>"
    }'
WHERE template_name = 'recovery';

-- =====================================================
-- 3. CONFIGURE SMTP SETTINGS (OPTIONAL)
-- =====================================================

-- Option 1: Configure Gmail SMTP (Recommended for better deliverability)
-- Note: You'll need to generate a Gmail App Password first
-- Go to: Google Account Settings > Security > 2-Step Verification > App passwords

UPDATE auth.config 
SET smtp = '{
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "contactneatrix@gmail.com",
    "pass": "YOUR_GMAIL_APP_PASSWORD_HERE",
    "admin_email": "contactneatrix@gmail.com",
    "max_frequency": 60
}'
WHERE id = 1;

-- Option 2: Use Supabase Default SMTP (Alternative)
-- Uncomment the following if you prefer to use Supabase's default SMTP
-- UPDATE auth.config 
-- SET smtp = '{
--     "admin_email": "contactneatrix@gmail.com",
--     "max_frequency": 60
-- }'
-- WHERE id = 1;

-- =====================================================
-- 4. UPDATE SITE URL AND REDIRECT URLS
-- =====================================================

-- Update site URL (replace with your actual domain)
UPDATE auth.config 
SET site_url = 'https://your-domain.com'
WHERE id = 1;

-- Configure redirect URLs for email confirmations
-- Add your domain to the allowed redirect URLs
INSERT INTO auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, from_ip_address, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    NULL,
    NULL,
    NULL,
    'https://your-domain.com/auth/callback',
    NULL,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. VERIFY CONFIGURATION
-- =====================================================

-- Check if email templates are properly configured
SELECT 
    template_name,
    CASE 
        WHEN email_template IS NOT NULL THEN 'Configured ✅'
        ELSE 'Not Configured ❌'
    END as status,
    CASE 
        WHEN email_template LIKE '%contactneatrix@gmail.com%' THEN 'Contact Info Updated ✅'
        ELSE 'Contact Info Missing ❌'
    END as contact_status
FROM auth.config 
WHERE template_name IN ('confirmation', 'recovery');

-- Check SMTP configuration
SELECT 
    CASE 
        WHEN smtp IS NOT NULL THEN 'SMTP Configured ✅'
        ELSE 'SMTP Not Configured ❌'
    END as smtp_status,
    CASE 
        WHEN smtp LIKE '%contactneatrix@gmail.com%' THEN 'Sender Email Set ✅'
        ELSE 'Sender Email Not Set ❌'
    END as sender_status
FROM auth.config 
WHERE id = 1;

-- =====================================================
-- 6. TEST EMAIL FUNCTIONALITY
-- =====================================================

-- Test signup confirmation email (replace with a test email)
-- INSERT INTO auth.users (
--     id,
--     email,
--     email_confirmed_at,
--     created_at,
--     updated_at
-- ) VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     NULL,
--     NOW(),
--     NOW()
-- );

-- =====================================================
-- DEPLOYMENT CHECKLIST
-- =====================================================

/*
Before deploying to production, ensure:

1. ✅ Replace 'YOUR_GMAIL_APP_PASSWORD_HERE' with actual Gmail App Password
2. ✅ Update 'https://your-domain.com' with your actual domain
3. ✅ Test email delivery in development environment
4. ✅ Verify all email templates render correctly
5. ✅ Check spam folder for test emails
6. ✅ Confirm contact information is correct:
   - Email: contactneatrix@gmail.com
   - Phone: +2349034842430
   - WhatsApp: https://wa.me/2349034842430
7. ✅ Set up proper DNS records (SPF, DKIM, DMARC) for better deliverability
8. ✅ Monitor email delivery rates and bounce rates

SMTP Configuration Steps:
1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use the generated password in the SMTP configuration above
5. Test email delivery

For support:
- Email: contactneatrix@gmail.com
- Phone: +2349034842430
- WhatsApp: https://wa.me/2349034842430
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================