import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Mail, ArrowLeft, RefreshCw, MessageCircle, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const EmailVerificationPage = () => {
  const location = useLocation();
  const email = location.state?.email || '';

  const handleResendEmail = () => {
    // This would trigger a resend email verification function
    // For now, we'll show a simple alert
    alert('Verification email sent! Please check your inbox.');
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(
      `Hi! I need help with email verification for my account: ${email}`
    );
    window.open(`https://wa.me/2349034842430?text=${message}`, '_blank');
  };

  const handleCallSupport = () => {
    window.location.href = 'tel:+2349034842430';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">{/* Adjust padding to account for fixed header */}
        <div className="container mx-auto max-w-md">
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Check Your Email
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                We've sent a verification link to your email address
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email Display */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground break-all text-sm">
                    {email || 'your-email@example.com'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click the verification link in the email to activate your account and start booking our cleaning services.
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-blue-900 text-sm">Next Steps:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your inbox for our verification email</li>
                  <li>• Look in your spam/junk folder if you don't see it</li>
                  <li>• Click the "Verify Email" button in the email</li>
                  <li>• Return here to sign in to your account</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </button>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center space-x-2 border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>

              {/* Support Section */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground text-center mb-4 text-sm">
                  Need Help?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWhatsAppSupport}
                    className="flex flex-col items-center space-y-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-foreground">WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCallSupport}
                    className="flex flex-col items-center space-y-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium text-foreground">Call Us</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Our support team is available 24/7 to help you
                </p>
              </div>

              {/* Footer Message */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or contact support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerificationPage;