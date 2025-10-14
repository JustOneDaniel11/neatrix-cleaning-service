#!/bin/bash

# =====================================================
# Neatrix Email Templates - Management API Deployment
# =====================================================
# This script uses the Supabase Management API to configure
# email templates correctly.
#
# REQUIRED SETUP:
# 1. Get your access token: https://supabase.com/dashboard/account/tokens
# 2. Get your project reference from your project URL
# 3. Replace the placeholders below
# =====================================================

# Configuration - REPLACE THESE VALUES
SUPABASE_ACCESS_TOKEN="sbp_d4c76c88fe5d9c844abcae08faf1e69408698f1d"
PROJECT_REF="hrkpbuenwejwspjrfgkd"
SITE_URL="https://neatrix.vercel.app"
GMAIL_APP_PASSWORD="cetrijhtpkbplrkw"  # Generate from Google Account Security

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Neatrix Email Templates Deployment${NC}"
echo "=================================================="

# Check if required variables are set
if [[ "$SUPABASE_ACCESS_TOKEN" == "your-access-token-here" ]]; then
    echo -e "${RED}❌ Error: Please set your SUPABASE_ACCESS_TOKEN${NC}"
    echo "Get it from: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

if [[ "$PROJECT_REF" == "your-project-ref-here" ]]; then
    echo -e "${RED}❌ Error: Please set your PROJECT_REF${NC}"
    echo "Find it in your Supabase project URL"
    exit 1
fi

echo -e "${YELLOW}📧 Configuring Email Templates...${NC}"

# Configure email templates and SMTP
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_confirmation": "Welcome to Neatrix! 🎉 — Confirm your account",
    "mailer_templates_confirmation_content": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Welcome to Neatrix!</title></head><body style=\"font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;\"><div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);\"><div style=\"background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; padding: 40px 30px; text-align: center;\"><h1 style=\"margin: 0; font-size: 28px;\">Welcome to Neatrix! 🎉</h1><p style=\"margin: 8px 0 0; opacity: 0.9;\">Your cleaning service journey starts here</p></div><div style=\"padding: 40px 30px; text-align: center;\"><h2 style=\"color: #1e293b; margin-bottom: 16px;\">Thanks for joining Neatrix!</h2><p style=\"color: #475569; margin-bottom: 32px; line-height: 1.7;\">We are excited to have you as part of our community. To get started with our premium cleaning services, please confirm your email address by clicking the button below.</p><a href=\"{{ .ConfirmationURL }}\" style=\"display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0;\">Confirm My Email</a><div style=\"margin: 32px 0; padding: 20px; background: #f8fafc; border-radius: 8px;\"><p style=\"margin: 0; font-size: 14px; color: #64748b;\"><strong>Button not working?</strong><br>Copy and paste this link: {{ .ConfirmationURL }}</p></div></div><div style=\"background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;\"><p style=\"margin: 0; font-size: 14px; color: #64748b;\"><strong>Need help?</strong> Contact contactneatrix@gmail.com</p><div style=\"margin-top: 16px;\"><a href=\"mailto:contactneatrix@gmail.com\" style=\"color: #6a1b9a; text-decoration: none; margin: 0 10px;\">contactneatrix@gmail.com</a><a href=\"tel:+2349034842430\" style=\"color: #6a1b9a; text-decoration: none; margin: 0 10px;\">📞 +2349034842430</a><a href=\"https://wa.me/2349034842430\" style=\"color: #6a1b9a; text-decoration: none; margin: 0 10px;\">WhatsApp</a></div></div></div></body></html>",
    "mailer_subjects_recovery": "Reset Your Neatrix Password 🔐",
    "mailer_templates_recovery_content": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Reset Your Password</title></head><body style=\"font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;\"><div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);\"><div style=\"background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; padding: 40px 30px; text-align: center;\"><h1 style=\"margin: 0; font-size: 28px;\">Password Reset Request 🔐</h1><p style=\"margin: 8px 0 0; opacity: 0.9;\">Let us get you back into your account</p></div><div style=\"padding: 40px 30px; text-align: center;\"><h2 style=\"color: #1e293b; margin-bottom: 16px;\">Reset Your Password</h2><p style=\"color: #475569; margin-bottom: 32px; line-height: 1.7;\">No worries! It happens to the best of us. Click the button below to create a new password for your Neatrix account and get back to booking amazing cleaning services.</p><a href=\"{{ .ConfirmationURL }}\" style=\"display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0;\">Reset My Password</a><div style=\"margin: 32px 0; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px;\"><p style=\"margin: 0; color: #92400e; font-weight: 600;\">⏳ Important: Link Expires Soon</p><p style=\"margin: 8px 0 0; color: #b45309; font-size: 14px;\">This password reset link will expire in 1 hour for security reasons.</p></div><div style=\"margin: 32px 0; padding: 20px; background: #f8fafc; border-radius: 8px;\"><p style=\"margin: 0; font-size: 14px; color: #64748b;\"><strong>Button not working?</strong><br>Copy and paste this link: {{ .ConfirmationURL }}</p></div></div><div style=\"background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;\"><p style=\"margin: 0; font-size: 14px; color: #64748b;\"><strong>Need help?</strong> Contact contactneatrix@gmail.com</p><div style=\"margin-top: 16px;\"><a href=\"mailto:contactneatrix@gmail.com\" style=\"color: #6a1b9a; text-decoration: none; margin: 0 10px;\">contactneatrix@gmail.com</a><a href=\"tel:+2349034842430\" style=\"color: #6a1b9a; text-decoration: none; margin: 0 10px;\">📞 +2349034842430</a><a href=\"https://wa.me/2349034842430\" style=\"color: #6a1b9a; text-decoration: none; margin: 0 10px;\">WhatsApp</a></div></div></div></body></html>",
    "site_url": "'$SITE_URL'",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "contactneatrix@gmail.com",
    "smtp_pass": "'$GMAIL_APP_PASSWORD'",
    "smtp_admin_email": "contactneatrix@gmail.com"
  }'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Email templates configured successfully!${NC}"
else
    echo -e "${RED}❌ Failed to configure email templates${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔍 Verifying configuration...${NC}"

# Get current configuration to verify
curl -X GET "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | jq 'to_entries | map(select(.key | startswith("mailer_"))) | from_entries'

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================================="
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Test email delivery by signing up a test user"
echo "2. Check your email templates in the Supabase Dashboard"
echo "3. Verify SMTP settings are working"
echo ""
echo -e "${BLUE}Contact Information Updated:${NC}"
echo "📧 Email: contactneatrix@gmail.com"
echo "📞 Phone: +2349034842430"
echo "💬 WhatsApp: https://wa.me/2349034842430"