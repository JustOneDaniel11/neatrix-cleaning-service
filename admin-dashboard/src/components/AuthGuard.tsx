import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { ShieldCheck } from 'lucide-react';
import SecurityLoader from './SecurityLoader';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { state } = useSupabaseData();
  const [showLoader, setShowLoader] = useState(true);

  // Show SecurityLoader for 2 seconds before proceeding
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show sleek security loader for 2 seconds
  if (showLoader) {
    return <SecurityLoader message="Verifying Authentication" size="lg" />;
  }

  // Show loading while authentication is being initialized
  if (state.loading) {
    return <SecurityLoader message="Checking Authentication" size="lg" />;
  }

  // Only show error if user is not authenticated AND there's a critical error
  // Don't show error page if user is authenticated (even with profile errors)
  if (state.error && !state.isAuthenticated && !state.authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-xl font-semibold text-gray-900">Authentication Error</span>
          </div>
          <p className="text-red-600 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check for session persistence flag as backup
  const hasRememberSession = localStorage.getItem("neatrix-admin-remember-session") === "true";
  
  // Redirect to login if not authenticated and no session persistence
  if (!state.isAuthenticated || !state.authUser) {
    // If we have a remember session flag but no auth state, wait a bit longer for initialization
    if (hasRememberSession && !state.loading) {
      console.log('🔄 AuthGuard: Session persistence detected, waiting for auth initialization...');
      return <SecurityLoader message="Restoring Session" size="lg" />;
    }
    
    console.log('🔄 AuthGuard: Redirecting to login - not authenticated');
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated, render children (ignore non-critical errors like profile fetch failures)
  console.log('✅ AuthGuard: User authenticated, rendering protected content');
  return <>{children}</>;
}