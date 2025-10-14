# Neatrix Email Templates Configuration Guide

## Overview
This guide explains how to implement the new branded Neatrix email templates in Supabase to replace the default plain-text templates with professional, branded HTML emails.

## Email Templates Created

### 1. Sign-Up Confirmation Email
- **File**: `src/email-templates/neatrix-signup-confirmation.html`
- **Subject**: "Welcome to Neatrix Admin 🎉 — Confirm your account"
- **Purpose**: Welcome new users and confirm their email address
- **Features**: 
  - Purple gradient branding (#6a1b9a to #8e24aa)
  - Modern card-style layout
  - Feature highlights (Analytics, User Management, Security)
  - Multiple support contact options
  - Mobile-responsive design

### 2. Password Reset Email
- **File**: `src/email-templates/neatrix-password-reset.html`
- **Subject**: "Reset your Neatrix password securely 🔒"
- **Purpose**: Secure password reset for existing users
- **Features**:
  - Security-focused messaging
  - Clear call-to-action button
  - Security features explanation
  - 24-hour expiration notice
  - Professional support links

## Implementation Steps

### Step 1: Configure Sender Email (IMPORTANT)
To use `contactneatrix@gmail.com` as the sender email for all Supabase authentication emails:

1. **In Supabase Dashboard**:
   - Go to **Authentication** → **Settings**
   - Scroll to **SMTP Settings**
   - Configure the following:
     - **SMTP Host**: `smtp.gmail.com`
     - **SMTP Port**: `587` (or `465` for SSL)
     - **SMTP User**: `contactneatrix@gmail.com`
     - **SMTP Password**: [Your Gmail App Password - see below]
     - **Sender Email**: `contactneatrix@gmail.com`
     - **Sender Name**: `Neatrix Support`

2. **Gmail App Password Setup**:
   - Go to your Google Account settings
   - Navigate to **Security** → **2-Step Verification**
   - Generate an **App Password** for "Mail"
   - Use this app password (not your regular Gmail password) in SMTP settings

3. **Alternative: Use Supabase's Default SMTP**:
   - If you prefer to use Supabase's built-in SMTP service
   - Simply set the **Sender Email** to `contactneatrix@gmail.com`
   - Note: Some email providers may mark these as spam

### Step 2: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### Step 3: Configure Sign-Up Confirmation Template
1. Select **"Confirm signup"** template
2. Update the **Subject** to:
   ```
   Welcome to Neatrix Admin 🎉 — Confirm your account
   ```
3. Replace the entire **Message (Body)** with the content from:
   `src/email-templates/neatrix-signup-confirmation.html`

### Step 4: Configure Password Reset Template
1. Select **"Reset password"** template
2. Update the **Subject** to:
   ```
   Reset your Neatrix password securely 🔒
   ```
3. Replace the entire **Message (Body)** with the content from:
   `src/email-templates/neatrix-password-reset.html`

### Step 5: Configure Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to your domain:
   - Production: `https://your-domain.com`
   - Development: `http://localhost:8081` (for admin)
3. Add **Redirect URLs**:
   - `https://your-domain.com/admin.html#/admin/reset-password`
   - `http://localhost:8081/admin.html#/admin/reset-password` (for development)
   - `https://your-domain.com/email-verification-success`
   - `http://localhost:8081/email-verification-success` (for development)

### Step 6: Template Variables
Both templates use these Supabase variables:
- `{{ .ConfirmationURL }}` - The verification/reset link
- `{{ .Email }}` - User's email address (optional)
- `{{ .Token }}` - Verification token (optional)

## Design Features

### Visual Design
- **Color Scheme**: Purple gradient (#6a1b9a to #8e24aa)
- **Typography**: Inter font family with system fallbacks
- **Layout**: Centered, card-style container with soft shadows
- **Buttons**: Rounded corners (12px) with hover effects
- **Icons**: Emoji-based for better email client compatibility

### Responsive Design
- Mobile-optimized layout
- Flexible grid system
- Scalable typography
- Touch-friendly button sizes

### Accessibility
- High contrast text colors
- Descriptive alt text for visual elements
- Semantic HTML structure
- Screen reader friendly

### Email Client Compatibility
- Inline CSS for maximum compatibility
- Fallback fonts for different systems
- Table-based layouts where needed
- Tested across major email clients

## Testing Instructions

### Step 1: Test Sign-Up Confirmation
1. Create a new test account in your application
2. Check the email received matches the new template
3. Verify the confirmation link works correctly
4. Ensure mobile responsiveness

### Step 2: Test Password Reset
1. Use the "Forgot Password" feature
2. Check the email received matches the new template
3. Verify the reset link works correctly
4. Test the 24-hour expiration (optional)

### Step 3: Cross-Platform Testing
Test emails in various clients:
- Gmail (web and mobile)
- Outlook (web and desktop)
- Apple Mail
- Yahoo Mail
- Mobile email apps

## Customization Options

### Logo Integration
To add the actual Neatrix logo:
1. Upload logo to a public CDN or hosting service
2. Replace the text logo in templates:
   ```html
   <div class="logo">N</div>
   ```
   With:
   ```html
   <img src="https://your-cdn.com/neatrix-logo.png" alt="Neatrix" style="width: 60px; height: 60px;">
   ```

### Color Customization
To modify the purple gradient:
1. Find all instances of `#6a1b9a` and `#8e24aa`
2. Replace with your preferred brand colors
3. Update hover states and accent colors accordingly

### Content Customization
- Update contact information (phone, email, WhatsApp)
- Modify feature descriptions
- Adjust messaging tone
- Add/remove sections as needed

## Support Information

### Contact Details Used
- **Email**: support@neatrix.com
- **Phone**: +2349034842430
- **WhatsApp**: https://wa.me/2349034842430

### Update Instructions
To change contact information:
1. Search for contact details in both template files
2. Replace with your actual support channels
3. Update links and phone numbers
4. Re-upload to Supabase

## Security Considerations

### Link Expiration
- Confirmation links expire in 24 hours (Supabase default)
- Password reset links expire in 24 hours (Supabase default)
- Users are informed about expiration in the emails

### Best Practices
- Never include sensitive information in emails
- Use HTTPS for all links
- Implement proper redirect URL validation
- Monitor for suspicious email activity

## Troubleshooting

### Common Issues
1. **Template not updating**: Clear browser cache and check Supabase dashboard
2. **Links not working**: Verify redirect URLs in Authentication settings
3. **Styling issues**: Check email client compatibility
4. **Images not loading**: Ensure images are hosted on public CDN

### Debugging Steps
1. Send test emails to multiple email addresses
2. Check Supabase logs for email delivery status
3. Verify template syntax in Supabase dashboard
4. Test with different email clients

## Contact Information Updates

All email templates have been updated with the new contact information:

### Updated Contact Details
- **Email**: `contactneatrix@gmail.com` (previously `support@neatrix.com`)
- **Phone**: `+2349034842430`
- **WhatsApp**: Available via the same phone number

### Templates Updated
- ✅ `neatrix-admin-password-reset.html`
- ✅ `neatrix-signup-confirmation.html`
- ✅ `neatrix-main-password-reset.html`
- ✅ `neatrix-password-reset.html`

All templates now include both email and phone contact options with proper formatting and accessibility.

## Deployment Checklist

- [ ] SMTP settings configured with `contactneatrix@gmail.com`
- [ ] Gmail App Password generated and configured
- [ ] Sign-up confirmation template uploaded to Supabase
- [ ] Password reset template uploaded to Supabase
- [ ] Subject lines updated
- [ ] Redirect URLs configured
- [ ] Contact information updated
- [ ] Templates tested with real email addresses
- [ ] Mobile responsiveness verified
- [ ] Cross-platform compatibility checked
- [ ] Logo and branding finalized
- [ ] Security settings reviewed

## Maintenance

### Regular Updates
- Review email performance metrics
- Update contact information as needed
- Refresh branding elements periodically
- Monitor email deliverability rates

### Version Control
- Keep template files in version control
- Document any changes made
- Maintain backup copies of working templates
- Test thoroughly before deploying updates

---

**Note**: These templates are designed to work with Supabase's authentication system. Ensure your Supabase project is properly configured before implementing these templates.