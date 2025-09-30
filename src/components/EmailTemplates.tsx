import React from 'react';

interface EmailVerificationTemplateProps {
  userFirstName: string;
  verificationLink: string;
}

export const EmailVerificationTemplate: React.FC<EmailVerificationTemplateProps> = ({
  userFirstName,
  verificationLink
}) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      color: '#333333'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#ffffff',
          margin: '0',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Welcome to CleanPro Services!
        </h1>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '30px 20px',
        lineHeight: '1.6'
      }}>
        <h2 style={{
          color: '#1f2937',
          fontSize: '20px',
          marginBottom: '20px'
        }}>
          Hi {userFirstName},
        </h2>

        <p style={{
          fontSize: '16px',
          marginBottom: '20px',
          color: '#4b5563'
        }}>
          Thank you for signing up with CleanPro Services! We're excited to help you keep your space spotless.
        </p>

        <p style={{
          fontSize: '16px',
          marginBottom: '30px',
          color: '#4b5563'
        }}>
          To get started, please verify your email address by clicking the button below:
        </p>

        {/* CTA Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <a
            href={verificationLink}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '15px 30px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
              minWidth: '200px'
            }}
          >
            Verify Email Address
          </a>
        </div>

        {/* Alternative Link */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 10px 0'
          }}>
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style={{
            fontSize: '14px',
            color: '#2563eb',
            wordBreak: 'break-all',
            margin: '0'
          }}>
            {verificationLink}
          </p>
        </div>

        {/* What's Next */}
        <div style={{
          borderLeft: '4px solid #2563eb',
          paddingLeft: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            marginBottom: '15px'
          }}>
            What's Next?
          </h3>
          <ul style={{
            color: '#4b5563',
            fontSize: '14px',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}>Complete your profile setup</li>
            <li style={{ marginBottom: '8px' }}>Browse our cleaning services</li>
            <li style={{ marginBottom: '8px' }}>Book your first cleaning session</li>
            <li style={{ marginBottom: '8px' }}>Enjoy a spotless space!</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{
            color: '#1f2937',
            fontSize: '16px',
            marginBottom: '15px'
          }}>
            Need Help?
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 10px 0'
          }}>
            Our support team is here to help you 24/7
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <a
              href="tel:+2348031234567"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📞 Call Us
            </a>
            <a
              href="https://wa.me/2348031234567"
              style={{
                color: '#25d366',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              💬 WhatsApp
            </a>
            <a
              href="mailto:contactneatrix@gmail.com"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✉️ Email
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0 0 10px 0'
        }}>
          This email was sent to verify your CleanPro Services account.
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0'
        }}>
          © 2024 CleanPro Services. All rights reserved.
        </p>
      </div>
    </div>
  );
};

interface WelcomeEmailTemplateProps {
  userFirstName: string;
  loginLink: string;
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailTemplateProps> = ({
  userFirstName,
  loginLink
}) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      color: '#333333'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#16a34a',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#ffffff',
          margin: '0',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🎉 Welcome to CleanPro Services!
        </h1>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '30px 20px',
        lineHeight: '1.6'
      }}>
        <h2 style={{
          color: '#1f2937',
          fontSize: '20px',
          marginBottom: '20px'
        }}>
          Hi {userFirstName},
        </h2>

        <p style={{
          fontSize: '16px',
          marginBottom: '20px',
          color: '#4b5563'
        }}>
          Congratulations! Your email has been successfully verified and your CleanPro Services account is now active.
        </p>

        <p style={{
          fontSize: '16px',
          marginBottom: '30px',
          color: '#4b5563'
        }}>
          You can now access all our premium cleaning services and book your first session.
        </p>

        {/* CTA Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <a
            href={loginLink}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '15px 30px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
              minWidth: '200px'
            }}
          >
            Access Your Dashboard
          </a>
        </div>

        {/* Services Preview */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            Our Premium Services
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏠</div>
              <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 'bold' }}>House Cleaning</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏢</div>
              <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 'bold' }}>Office Cleaning</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>✨</div>
              <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 'bold' }}>Deep Cleaning</div>
            </div>
          </div>
        </div>

        {/* Special Offer */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#92400e',
            fontSize: '18px',
            marginBottom: '10px'
          }}>
            🎁 Welcome Offer!
          </h3>
          <p style={{
            color: '#92400e',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0'
          }}>
            Get 20% off your first cleaning service
          </p>
          <p style={{
            color: '#92400e',
            fontSize: '14px',
            margin: '5px 0 0 0'
          }}>
            Use code: WELCOME20
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0 0 10px 0'
        }}>
          Thank you for choosing CleanPro Services for your cleaning needs.
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0'
        }}>
          © 2024 CleanPro Services. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// Utility function to generate email HTML
export const generateEmailHTML = (template: React.ReactElement): string => {
  // This would typically use a server-side rendering solution
  // For now, we'll return a placeholder
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CleanPro Services</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .content { padding: 20px 15px !important; }
          .button { width: 100% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
      ${template}
    </body>
    </html>
  `;
};