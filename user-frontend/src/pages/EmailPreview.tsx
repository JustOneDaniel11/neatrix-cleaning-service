import React from 'react';

const EmailPreview: React.FC = () => {
  // Mock confirmation URL for preview
  const mockConfirmationURL = "https://your-app.supabase.co/auth/v1/verify?token=mock-token&type=signup&redirect_to=http://localhost:5173/dashboard";

  const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Neatrix Professional Cleaning Services</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-message {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .message {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .alternative-link {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #3b82f6;
        }
        .alternative-link p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        }
        .alternative-link a {
            color: #3b82f6;
            word-break: break-all;
        }
        .features {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .feature {
            text-align: center;
            flex: 1;
            min-width: 150px;
            margin: 10px;
        }
        .feature-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
        }
        .feature h3 {
            font-size: 14px;
            color: #1f2937;
            margin: 0;
            font-weight: 600;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 30px 20px;
            }
            .features {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Neatrix Professional Cleaning Services</h1>
            <p>Professional Cleaning Solutions</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                Welcome to Neatrix! 🎉
            </div>
            
            <div class="message">
                <p>Thank you for choosing Neatrix Professional Cleaning Services for your cleaning needs! We're excited to have you join our community of satisfied customers.</p>
                
                <p>To get started and secure your account, please verify your email address by clicking the button below:</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${mockConfirmationURL}" class="verify-button">
                    ✅ Verify My Email Address
                </a>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📅</div>
                    <h3>Easy Booking</h3>
                </div>
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <h3>Quality Service</h3>
                </div>
                <div class="feature">
                    <div class="feature-icon">💬</div>
                    <h3>24/7 Support</h3>
                </div>
            </div>
            
            <div class="alternative-link">
                <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
                <p><a href="${mockConfirmationURL}">${mockConfirmationURL}</a></p>
            </div>
            
            <div class="message">
                <p><strong>What happens next?</strong></p>
                <ul style="color: #4b5563; padding-left: 20px;">
                    <li>Access your personalized dashboard</li>
                    <li>Book cleaning services instantly</li>
                    <li>Track your service history</li>
                    <li>Manage your preferences</li>
                    <li>Get exclusive member discounts</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Need help?</strong> Our support team is here for you!</p>
            <div class="social-links">
                <a href="tel:+2349034842430">📞 Call Us</a>
                <a href="https://wa.me/2349034842430">💬 WhatsApp</a>
                <a href="mailto:contactneatrix@gmail.com">✉️ Email</a>
            </div>
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with Neatrix Professional Cleaning Services, please ignore this email.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © 2024 Neatrix Professional Cleaning Services. All rights reserved.<br>
                Professional cleaning services you can trust.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            📧 Email Confirmation Template Preview
          </h1>
          <p className="text-gray-600 mb-4">
            This is how the email confirmation message will appear to users when they sign up for Neatrix Professional Cleaning Services.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> The confirmation URL shown is a mock URL for preview purposes. 
              In production, this will be replaced with the actual Supabase verification link.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Email Preview</h2>
          </div>
          <div className="p-6">
            <iframe
              srcDoc={emailHTML}
              className="w-full h-[800px] border border-gray-300 rounded-lg"
              title="Email Template Preview"
            />
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Template Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Design Elements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Modern gradient header with Neatrix branding</li>
                <li>• Responsive design for mobile and desktop</li>
                <li>• Professional color scheme (blue gradient)</li>
                <li>• Clean typography and spacing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Functionality</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Prominent verification button</li>
                <li>• Alternative link for accessibility</li>
                <li>• Contact information and support links</li>
                <li>• Security notice about link expiration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;