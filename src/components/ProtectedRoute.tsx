import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { FullScreenLoader } from '@/components/ui/loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useSupabaseData();

  if (state.loading) {
    return <FullScreenLoader text="Authenticating..." />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;