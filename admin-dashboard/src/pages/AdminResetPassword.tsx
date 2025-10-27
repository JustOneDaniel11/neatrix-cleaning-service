import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, LogIn, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been reset. You can now sign in with your new password.",
      });
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      toast({
        title: "Reset failed",
        description: (err as { message?: string })?.message || "Unable to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

      <div className="w-full max-w-md">
        {/* Header brand */}
        <div className="mb-6 flex items-center justify-center">
          <img 
            src="/IOS app menu-favicon-1024by1024-2.png" 
            alt="Neatrix Logo" 
            className="h-9 w-9 mr-2 rounded-lg shadow-sm"
          />
          <span className="text-2xl font-semibold tracking-tight text-gray-900">Neatrix Admin</span>
        </div>

        {/* Reset password card */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_20px_45px_-10px_rgba(0,0,0,0.25)] border border-white/50 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600" />
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 mb-4">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Reset Your Password</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your new password below</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer w-full rounded-xl border border-gray-200 bg-white px-3 pl-10 pr-10 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-transparent"
                  placeholder="New Password"
                  aria-label="New Password"
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute left-10 -top-2.5 inline-flex items-center gap-2 rounded-full bg-white px-2 text-xs text-gray-500 transition-all peer-placeholder-shown:left-10 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:left-10 peer-focus:bg-white peer-focus:text-purple-600"
                >
                  <Lock className="h-4 w-4 text-gray-400" />
                  New Password
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

              {/* Confirm Password */}
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="peer w-full rounded-xl border border-gray-200 bg-white px-3 pl-10 pr-10 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-transparent"
                  placeholder="Confirm Password"
                  aria-label="Confirm Password"
                />
                <label
                  htmlFor="confirmPassword"
                  className="pointer-events-none absolute left-10 -top-2.5 inline-flex items-center gap-2 rounded-full bg-white px-2 text-xs text-gray-500 transition-all peer-placeholder-shown:left-10 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:left-10 peer-focus:bg-white peer-focus:text-purple-600"
                >
                  <Lock className="h-4 w-4 text-gray-400" />
                  Confirm Password
                </label>
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                  <CheckCircle className={`h-3 w-3 ${password.length >= 8 ? 'text-green-600' : 'text-gray-300'}`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 ${password === confirmPassword && password.length > 0 ? 'text-green-600' : ''}`}>
                  <CheckCircle className={`h-3 w-3 ${password === confirmPassword && password.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                  Passwords match
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || password !== confirmPassword || password.length < 8}
                className="group relative w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 px-4 py-3 text-white shadow-md transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent)] transition" />
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    Update Password
                  </>
                )}
              </button>

              {/* Back to login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-purple-700 hover:text-purple-800 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}