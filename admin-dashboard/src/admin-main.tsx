import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AdminProvider } from './contexts/AdminContext';
import { SupabaseDataProvider } from './contexts/SupabaseDataContext';
import AuthGuard from './components/AuthGuard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginAdvanced from './pages/AdminLoginAdvanced';
import AdminResetPassword from './pages/AdminResetPassword';
import AdminLiveChat from './pages/AdminLiveChat';
import LiveSupportChat from './pages/LiveSupportChat';
import './index.css';
import { Toaster } from './components/ui/toaster';

// Error boundary for development errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Handle specific DOM manipulation errors
    if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error detected - attempting graceful recovery');
      // Don't force reload, just log and continue
    }
  }

  handleRetry = () => {
    // Clear error state and attempt to remount children
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The application encountered an error and needs to reload.</p>
            {import.meta.env.DEV && this.state.errorInfo && (
              <pre className="bg-gray-100 p-4 rounded mb-4 text-sm overflow-auto max-h-40">
                {this.state.error?.toString()}
                {'\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById('admin-root');
if (!root) {
  throw new Error('Admin root element #admin-root not found');
}

ReactDOM.createRoot(root).render(
  <ErrorBoundary>
    <DarkModeProvider>
      <SupabaseDataProvider>
        <AdminProvider>
          <Router>
            <Routes>
              {/* Login routes - unprotected */}
              <Route path="/" element={<AdminLoginAdvanced />} />
              <Route path="/login" element={<AdminLoginAdvanced />} />
              <Route path="/reset-password" element={<AdminResetPassword />} />
              
              {/* Protected routes with proper auth guard */}
              <Route path="/overview" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/dashboard" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/bookings" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/users" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/contacts" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/notifications" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/payments" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/subscriptions" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/laundry" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/tracking" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/delivery" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/reviews" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/livechat" element={
                <AuthGuard redirectTo="/login">
                  <AdminDashboard />
                </AuthGuard>
              } />

              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </Router>
        </AdminProvider>
      </SupabaseDataProvider>
    </DarkModeProvider>
  </ErrorBoundary>
);