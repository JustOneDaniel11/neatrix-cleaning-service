import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useSupabaseData } from '../contexts/SupabaseDataContext';

const EmailVerificationSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useSupabaseData();
  // Removed direct use of query-only error; support hash fragment too
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<'success' | 'error'>('success');
  const [failureReason, setFailureReason] = useState<string | null>(null);

  useEffect(() => {
    // Supabase often returns params in the hash fragment (e.g., #error=...)
    const queryErr = searchParams.get('error') || searchParams.get('error_code');
    const queryDesc = searchParams.get('error_description');

    const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hash);
    const hashErr = hashParams.get('error') || hashParams.get('error_code');
    const hashDesc = hashParams.get('error_description') || hashParams.get('message');

    if (hashErr || hashDesc || queryErr || queryDesc) {
      setStatus('error');
      setFailureReason(hashDesc || queryDesc || hashErr || queryErr || 'Verification failed. Link invalid or expired.');
    } else {
      // If Supabase attached an access token or type=signup, treat as success
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const typeParam = hashParams.get('type') || searchParams.get('type');
      if (accessToken || typeParam === 'signup') {
        setStatus('success');
      }
    }
  }, [searchParams]);

  // Removed auto-redirect to allow manual navigation

  const handleGetStarted = () => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleBookNow = () => {
    navigate('/services');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {status === 'error'
                  ? '❌ Confirmation failed or link expired. Request a new link from the app or contact support.'
                  : '✅ Email confirmed successfully! Welcome to Neatrix.'}
              </CardTitle>
              <p className="text-lg text-gray-600">
                {status === 'error' ? (
                  <>Error details: {failureReason}</>
                ) : 'Your account is now active.'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Welcome Message */}
              {status !== 'error' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Your Account is Ready!
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Thank you for verifying your email address. You now have full access to all Neatrix Professional Cleaning Services features, 
                    including booking management, service history, and exclusive member benefits.
                  </p>
                </div>
              )}

              {/* What's Next Section */}
              {status !== 'error' && (
                <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">What's Next?</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Complete Your Profile</h4>
                      <p className="text-sm text-gray-600">Add your address and preferences for faster booking</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Book Your First Service</h4>
                      <p className="text-sm text-gray-600">Choose from our range of professional cleaning services</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Enjoy Premium Benefits</h4>
                      <p className="text-sm text-gray-600">Access member discounts and priority booking</p>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {state.isAuthenticated ? (
                  <div className="text-center">
                    <button
                      onClick={handleGetStarted}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <Home className="w-5 h-5" />
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Redirecting automatically in {countdown} seconds...
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Home className="w-5 h-5" />
                    <span>{status === 'error' ? 'Back to Sign In' : 'Sign In to Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleBookNow}
                  className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book a Service Now</span>
                </button>
              </div>

              {/* Special Offer */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 text-center">
                <h3 className="font-semibold text-green-800 mb-2">🎁 Welcome Bonus!</h3>
                <p className="text-green-700 text-sm mb-3">
                  Get 20% off your first cleaning service as a new member
                </p>
                <div className="bg-white px-4 py-2 rounded-lg inline-block">
                  <code className="text-green-800 font-mono font-semibold">WELCOME20</code>
                </div>
                <p className="text-xs text-green-600 mt-2">Use this code at checkout</p>
              </div>

              {/* Support Section */}
              <div className="border-t pt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Need help getting started? Our support team is here for you!
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://wa.me/2349034842430"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href="tel:+2349034842430"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    📞 Call Us
                  </a>
                  <a
                    href="mailto:contactneatrix@gmail.com"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    ✉️ Email
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerificationSuccessPage;