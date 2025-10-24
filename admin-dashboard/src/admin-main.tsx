import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AdminProvider } from './contexts/AdminContext';
import { SupabaseDataProvider } from './contexts/SupabaseDataContext';
import AdminDashboard from './pages/AdminDashboard';

import AdminLoginAdvanced from './pages/AdminLoginAdvanced';
import AdminResetPassword from './pages/AdminResetPassword';
import './index.css';
import { Toaster } from './components/ui/toaster';

const root = document.getElementById('admin-root');
if (!root) {
  throw new Error('Admin root element #admin-root not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <DarkModeProvider>
      <SupabaseDataProvider>
        <AdminProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<AdminLoginAdvanced />} />
              <Route path="/login" element={<AdminLoginAdvanced />} />
              <Route path="/admin/login" element={<AdminLoginAdvanced />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* Dedicated admin subpage routes */}
              <Route path="/admin/contact-message" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/notifications" element={<AdminDashboard />} />
              <Route path="/admin/payments" element={<AdminDashboard />} />
              <Route path="/admin/subscriptions" element={<AdminDashboard />} />
              <Route path="/admin/laundry" element={<AdminDashboard />} />
              <Route path="/admin/tracking" element={<AdminDashboard />} />
              <Route path="/admin/delivery" element={<AdminDashboard />} />
              <Route path="/admin/reviews" element={<AdminDashboard />} />

              <Route path="/reset-password" element={<AdminResetPassword />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </HashRouter>
        </AdminProvider>
      </SupabaseDataProvider>
    </DarkModeProvider>
  </React.StrictMode>
);