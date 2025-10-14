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

  // Only gate when we don't yet know auth status. If we have an
  // authUser value (including null after initialization), proceed.
  // Avoid blocking on general data loading to keep pages responsive.
  const isAuthUnknown = state.isAuthenticated === false && state.authUser === null && state.currentUser === null && state.loading;
  if (isAuthUnknown) {
    return <FullScreenLoader text="Authenticating..." />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname + location.search }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;