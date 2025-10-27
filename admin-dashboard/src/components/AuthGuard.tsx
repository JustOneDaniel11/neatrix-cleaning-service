import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { ShieldCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { state } = useSupabaseData();

  // Show error state if there's an authentication error
  if (state.error) {
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

  // Redirect to login if not authenticated
  if (!state.isAuthenticated || !state.authUser) {
    console.log('🔄 AuthGuard: Redirecting to login - not authenticated');
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated, render children
  console.log('✅ AuthGuard: User authenticated, rendering protected content');
  return <>{children}</>;
}