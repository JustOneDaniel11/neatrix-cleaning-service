# Supabase Email Template Configuration

## Setting Up Custom Email Verification Template

To use the custom email verification template, follow these steps in your Supabase dashboard:

### 1. Access Email Templates
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template

### 2. Update the Email Template
Replace the default template with the content from `src/email-templates/verification-email.html`

### 3. Configure Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to: `https://your-domain.com` (or `http://localhost:8080` for development)
3. Add **Redirect URLs**:
   - `https://your-domain.com/email-verification-success`
   - `http://localhost:8080/email-verification-success` (for development)

### 4. Email Template Variables
The template uses these Supabase variables:
- `{{ .ConfirmationURL }}` - The verification link
- `{{ .Email }}` - User's email address (if needed)
- `{{ .Token }}` - Verification token (if needed)

### 5. Subject Line
Update the email subject to:
```
🏠 Welcome to CleanPro! Please verify your email
```

### 6. Testing
1. Create a test account to verify the email template works
2. Check that the verification link redirects to `/email-verification-success`
3. Ensure the success page displays correctly

## Email Template Features

### Professional Design
- Clean, modern layout with CleanPro branding
- Mobile-responsive design
- Professional color scheme (blue gradient)

### Enhanced Content
- Welcoming tone with clear call-to-action
- Service highlights and benefits
- Multiple contact options (phone, WhatsApp, email)
- Security information (24-hour expiration)

### User Experience
- Large, prominent verification button
- Alternative text link for accessibility
- Clear instructions and next steps
- Professional footer with company information

## Success Page Features

### Dynamic Content
- Auto-redirect for authenticated users
- Countdown timer for better UX
- Personalized welcome message

### Action Items
- Clear next steps for new users
- Direct links to dashboard and services
- Welcome bonus code for first-time users

### Support Integration
- Multiple contact methods
- Help resources
- Professional support messaging

## Deployment Notes

1. Update the contact information in the email template:
   - Phone number: Replace `+1234567890` with actual number
   - WhatsApp: Update WhatsApp link with real number
   - Email: Replace `support@cleanpro.com` with contactneatrix@gmail.com

2. Update domain references:
   - Replace `your-domain.com` with actual domain
   - Update all URLs to match your production environment

3. Test thoroughly:
   - Send test verification emails
   - Verify all links work correctly
   - Check mobile responsiveness
   - Test with different email clients