import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

export default function AdminLoginAdvanced() {
  const navigate = useNavigate();
  const { dispatch } = useSupabaseData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const rememberedEmailKey = useMemo(() => "neatrix-admin-remember-email", []);

  useEffect(() => {
    const saved = localStorage.getItem(rememberedEmailKey);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, [rememberedEmailKey]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/admin/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (remember) {
        localStorage.setItem(rememberedEmailKey, email);
      } else {
        localStorage.removeItem(rememberedEmailKey);
      }

      dispatch({ type: "SET_AUTH_USER", payload: data.user });
      dispatch({ type: "SET_CURRENT_USER", payload: data.user });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordEmail(email); // Pre-fill with current email if available
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Enter your email",
        description: "Please enter your email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/admin.html#/admin/reset-password`,
      });
      if (error) throw error;
      
      toast({
        title: "Reset email sent successfully",
        description: "Check your inbox for the password reset link. It may take a few minutes to arrive.",
      });
      
      setShowForgotPasswordModal(false);
      setForgotPasswordEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast({
        title: "Reset failed",
        description: err?.message || "Unable to send reset email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/40 via-purple-700/40 to-purple-800/40" />
      <div className="absolute -z-10 inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] h-64 w-64 rounded-full bg-purple-400/25 blur-3xl" />
        <div className="absolute bottom-[5%] right-[15%] h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="w-full max-w-4xl">
        {/* Header brand */}
        <div className="mb-6 flex items-center justify-center">
          <img 
            src="/IOS app menu-favicon-1024by1024-2.png" 
            alt="Neatrix Logo" 
            className="h-9 w-9 mr-2 rounded-lg shadow-sm"
          />
          <span className="text-2xl font-semibold tracking-tight text-gray-900">Neatrix Admin</span>
        </div>

        {/* Split card layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-[0_20px_45px_-10px_rgba(0,0,0,0.25)]">
          {/* Left hero panel */}
          <div className="relative bg-gradient-to-br from-purple-700 to-purple-900 p-8 sm:p-10 text-white">
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">Welcome to Neatrix Admin</h2>
              <p className="text-purple-100 mt-2 text-sm">
                Manage users, monitor activity, and keep your platform running smoothly — all from one secure dashboard.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Secure access</p>
                    <p className="text-xs text-purple-200">Powered by Supabase authentication and session protection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Real-time insights</p>
                    <p className="text-xs text-purple-200">Stay updated with live data and activity tracking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Optimized workflow</p>
                    <p className="text-xs text-purple-200">Intuitive design for faster navigation and task management.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="relative bg-white/95 backdrop-blur-sm border border-white/50">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600" />
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900">Sign in</h3>
              <p className="text-sm text-gray-500 mb-6">Enter your admin credentials to access the dashboard.</p>

              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Email */}
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="peer w-full rounded-xl border border-gray-200 bg-white px-3 pl-10 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-transparent"
                    placeholder="Email"
                    aria-label="Email"
                  />
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-10 -top-2.5 inline-flex items-center gap-2 rounded-full bg-white px-2 text-xs text-gray-500 transition-all peer-placeholder-shown:left-10 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:left-10 peer-focus:bg-white peer-focus:text-purple-600"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email
                  </label>
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="peer w-full rounded-xl border border-gray-200 bg-white px-3 pl-10 pr-10 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-transparent"
                    placeholder="Password"
                    aria-label="Password"
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute left-10 -top-2.5 inline-flex items-center gap-2 rounded-full bg-white px-2 text-xs text-gray-500 transition-all peer-placeholder-shown:left-10 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:left-10 peer-focus:bg-white peer-focus:text-purple-600"
                  >
                    <Lock className="h-4 w-4 text-gray-400" />
                    Password
                  </label>
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="text-sm font-medium text-purple-700 hover:text-purple-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 px-4 py-3 text-white shadow-md transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                >
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent)] transition" />
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                      Sign in securely
                    </>
                  )}
                </button>

                {/* Helper text */}
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our <span className="underline cursor-pointer hover:text-purple-600">Terms of Use</span> and <span className="underline cursor-pointer hover:text-purple-600">Privacy Policy</span>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_20px_45px_-10px_rgba(0,0,0,0.25)] border border-white/50 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600" />
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 mb-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reset Your Password</h3>
                <p className="text-sm text-gray-500 mt-1">Enter your email address and we'll send you a reset link</p>
              </div>

              <div className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="peer w-full rounded-xl border border-gray-200 bg-white px-3 pl-10 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-transparent"
                    placeholder="Email address"
                    aria-label="Email address"
                  />
                  <label className="pointer-events-none absolute left-10 -top-2.5 inline-flex items-center gap-2 rounded-full bg-white px-2 text-xs text-gray-500 transition-all peer-placeholder-shown:left-10 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:left-10 peer-focus:bg-white peer-focus:text-purple-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email address
                  </label>
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setForgotPasswordEmail("");
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPasswordSubmit}
                    disabled={forgotPasswordLoading || !forgotPasswordEmail}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 px-4 py-3 text-white shadow-md transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}