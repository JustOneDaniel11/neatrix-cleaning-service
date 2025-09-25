import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

const ForgotPasswordPage = () => {
  const { resetPassword, state } = useSupabaseData();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Check Your Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-foreground">{email}</p>
                    <p className="text-sm text-muted-foreground">
                      Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Link
                      to="/login"
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                    >
                      Back to Sign In
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                      }}
                      className="w-full border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
                    >
                      Send Another Email
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Reset Your Password
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={state.loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;