
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
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: contactneatrix@gmail.com
SMTP Password: [YOUR_GMAIL_APP_PASSWORD]
Sender Name: Neatrix
Sender Email: contactneatrix@gmail.com
```

**⚠️ Important**: You need to generate a Gmail App Password:
1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use the 16-character password in SMTP settings

### 3. Upload Email Templates

**Location**: Supabase Dashboard → Authentication → Email Templates

#### A. Signup Confirmation Template
- **Template**: "Confirm signup"
- **Subject**: `Welcome to Neatrix! 🎉 — Confirm your account`
- **Body**: Copy content from `user-frontend/src/email-templates/neatrix-signup-confirmation.html`

#### B. Password Reset Template
- **Template**: "Reset password"
- **Subject**: `Reset Your Neatrix Password 🔐`
- **Body**: Copy content from `user-frontend/src/email-templates/neatrix-password-reset.html`

### 4. Configure URL Settings

**Location**: Supabase Dashboard → Authentication → URL Configuration

**Site URL**: `http://localhost:8080` (for development)
**Redirect URLs**:
- `http://localhost:8080/email-verification-success`
- `http://localhost:8080/auth/callback`
- `https://your-domain.com/email-verification-success` (for production)
- `https://your-domain.com/auth/callback` (for production)

### 5. Test Configuration

After completing the above steps, run:
```bash
node test-email-confirmation-integration.js
```

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
Generated on: 2025-10-19T10:56:28.052Z
Project: https://hrkpbuenwejwspjrfgkd.supabase.co
