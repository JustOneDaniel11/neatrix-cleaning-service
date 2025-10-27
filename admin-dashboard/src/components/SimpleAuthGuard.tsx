import React from 'react';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({ children }) => {
  // Always allow access - no authentication checks
  console.log('SimpleAuthGuard: Allowing access to admin dashboard');
  return <>{children}</>;
};

export default SimpleAuthGuard;