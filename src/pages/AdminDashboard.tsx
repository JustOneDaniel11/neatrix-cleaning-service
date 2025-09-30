import React, { useState } from 'react';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import AdminLayout from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import AdminBookings from '../components/admin/AdminBookings';
import AdminChat from '../components/admin/AdminChat';
import AdminNotifications from '../components/admin/AdminNotifications';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { state } = useSupabaseData();

  // Render the appropriate component based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'bookings':
        return <AdminBookings />;
      case 'chat':
        return <AdminChat />;
      case 'inspections':
        return <div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Inspections</h2><p className="text-gray-600 mt-2">Inspections management coming soon...</p></div>;
      case 'users':
        return <div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Users</h2><p className="text-gray-600 mt-2">User management coming soon...</p></div>;
      case 'reviews':
        return <div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Reviews</h2><p className="text-gray-600 mt-2">Review management coming soon...</p></div>;
      case 'payments':
        return <div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Payments</h2><p className="text-gray-600 mt-2">Payment management coming soon...</p></div>;
      case 'notifications':
        return <AdminNotifications />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;