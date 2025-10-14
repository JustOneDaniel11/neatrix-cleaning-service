# Neatrix Email Templates - Supabase Dashboard Configuration

## 🎯 Overview

This guide walks you through configuring Neatrix email templates using the Supabase Dashboard. This is the **recommended method for beginners** as it provides a user-friendly interface.

## 📋 Prerequisites

- Access to your Supabase project dashboard
- Gmail account with App Password generated
- Your domain URL ready

## 🚀 Step-by-Step Configuration

### Step 1: Access Email Templates

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure SMTP Settings

1. In the Authentication section, go to **Settings** → **SMTP Settings**
2. Enable **Custom SMTP** (recommended for better deliverability)
3. Configure the following settings:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: contactneatrix@gmail.com
SMTP Password: [Your Gmail App Password]
Sender Email: contactneatrix@gmail.com
Sender Name: Neatrix Cleaning Service
```

### Step 3: Configure Signup Confirmation Email

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Update the **Subject**:
   ```
   Welcome to Neatrix! 🎉 — Confirm your account
   ```

4. Replace the **HTML Content** with:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Neatrix!</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Neatrix! 🎉</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your cleaning service journey starts here</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #1e293b; margin-bottom: 16px;">Thanks for joining Neatrix!</h2>
            <p style="color: #475569; margin-bottom: 32px; line-height: 1.7;">
                We're excited to have you as part of our community. To get started with our premium cleaning services, 
                please confirm your email address by clicking the button below.
            </p>
            
            <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0;">
                Confirm My Email
            </a>
            
            <div style="margin: 32px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                    <strong>Button not working?</strong><br>
                    Copy and paste this link: {{ .ConfirmationURL }}
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
                <strong>Need help?</strong> Contact contactneatrix@gmail.com
            </p>
            <div style="margin-top: 16px;">
                <a href="mailto:contactneatrix@gmail.com" style="color: #6a1b9a; text-decoration: none; margin: 0 10px;">contactneatrix@gmail.com</a>
                <a href="tel:+2349034842430" style="color: #6a1b9a; text-decoration: none; margin: 0 10px;">📞 +2349034842430</a>
                <a href="https://wa.me/2349034842430" style="color: #6a1b9a; text-decoration: none; margin: 0 10px;">WhatsApp</a>
            </div>
        </div>
    </div>
</body>
</html>
```

5. Click **Save**

### Step 4: Configure Password Reset Email

1. Select **Reset Password** template
2. Update the **Subject**:
   ```
   Reset Your Neatrix Password 🔐
   ```

3. Replace the **HTML Content** with:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset Request 🔐</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Let's get you back into your account</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #1e293b; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #475569; margin-bottom: 32px; line-height: 1.7;">
                No worries! It happens to the best of us. Click the button below to create a new password 
                for your Neatrix account and get back to booking amazing cleaning services.
            </p>
            
            <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0;">
                Reset My Password
            </a>
            
            <!-- Warning Box -->
            <div style="margin: 32px 0; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-weight: 600;">⏳ Important: Link Expires Soon</p>
                <p style="margin: 8px 0 0; color: #b45309; font-size: 14px;">
                    This password reset link will expire in 1 hour for security reasons.
                </p>
            </div>
            
            <div style="margin: 32px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                    <strong>Button not working?</strong><br>
                    Copy and paste this link: {{ .ConfirmationURL }}
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
                <strong>Need help?</strong> Contact contactneatrix@gmail.com
            </p>
            <div style="margin-top: 16px;">
                <a href="mailto:contactneatrix@gmail.com" style="color: #6a1b9a; text-decoration: none; margin: 0 10px;">contactneatrix@gmail.com</a>
                <a href="tel:+2349034842430" style="color: #6a1b9a; text-decoration: none; margin: 0 10px;">📞 +2349034842430</a>
                <a href="https://wa.me/2349034842430" style="color: #6a1b9a; text-decoration: none; margin: 0 10px;">WhatsApp</a>
            </div>
        </div>
    </div>
</body>
</html>
```

4. Click **Save**

### Step 5: Configure Site URL

1. Go to **Authentication** → **Settings** → **URL Configuration**
2. Set your **Site URL** to your domain (e.g., `https://your-domain.com`)
3. Add any redirect URLs you need in the **Redirect URLs** section

## 🔐 Gmail App Password Setup

To use Gmail SMTP, you need to generate an App Password:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Click **Generate** and select **Mail**
5. Copy the generated 16-character password
6. Use this password in your SMTP configuration

## ✅ Testing Your Configuration

1. **Test Signup Email**: Create a test account to verify the confirmation email
2. **Test Password Reset**: Use the "Forgot Password" feature to test the reset email
3. **Check Delivery**: Ensure emails are not going to spam folders
4. **Verify Links**: Make sure all confirmation links work correctly

## 🎨 Customization Options

### Template Variables Available:
- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Token }}` - 6-digit OTP (alternative to URL)
- `{{ .SiteURL }}` - Your configured site URL
- `{{ .Email }}` - User's email address
- `{{ .Data }}` - User metadata

### Styling Tips:
- Use inline CSS for maximum email client compatibility
- Test across different email clients (Gmail, Outlook, Apple Mail)
- Keep the design responsive for mobile devices
- Use web-safe fonts and colors

## 🚨 Troubleshooting

### Common Issues:

1. **Emails not sending**: Check SMTP credentials and Gmail App Password
2. **Emails in spam**: Configure SPF, DKIM, and DMARC records for your domain
3. **Links not working**: Verify your Site URL and redirect URL configurations
4. **Template not updating**: Clear browser cache and check for syntax errors

### Support Contacts:
- **Email**: contactneatrix@gmail.com
- **Phone**: +2349034842430
- **WhatsApp**: https://wa.me/2349034842430

## 📚 Additional Resources

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Gmail SMTP Configuration](https://support.google.com/mail/answer/7126229)
- [Email Template Best Practices](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching)

---

**✨ Congratulations!** Your Neatrix email templates are now configured with updated contact information and professional styling.