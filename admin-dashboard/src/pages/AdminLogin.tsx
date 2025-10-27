import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { dispatch } = useSupabaseData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (err: unknown) {
      toast({
        title: "Sign in failed",
        description: (err as { message?: string })?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Enter your email",
        description: "Please enter your email to reset your password.",
      });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast({
        title: "Reset email sent",
        description: "Check your inbox for the reset link.",
      });
    } catch (err: unknown) {
      toast({
        title: "Reset failed",
        description: (err as { message?: string })?.message || "Unable to send reset email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/40 via-purple-700/40 to-purple-800/40" />
      <div className="absolute -z-10 inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute bottom-[5%] right-[15%] h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <ShieldCheck className="h-9 w-9 text-purple-600 mr-2" />
          <span className="text-2xl font-semibold tracking-tight text-gray-900">Neatrix Admin</span>
        </div>

        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/50">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-6">Access your admin dashboard</p>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

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
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-purple-700 hover:text-purple-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-white shadow-md transition hover:shadow-lg hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}