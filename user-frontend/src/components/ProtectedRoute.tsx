import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { FullScreenLoader } from '@/components/ui/loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useSupabaseData();
  const location = useLocation();

  // Show loading while initializing authentication
  if (state.isInitializing) {
    return <FullScreenLoader />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;