import React, { useState } from 'react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { state } = useSupabaseData();
  const navigate = useNavigate();

  const NavButton = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium ${
        activeSection === id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {state.error && (
            <p className="mt-2 text-sm text-red-600">{state.error}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex gap-2 mb-6">
            <NavButton id="overview" label="Overview" />
            <NavButton id="bookings" label="Bookings" />
            <NavButton id="chat" label="Chat" />
            <NavButton id="notifications" label="Notifications" />
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            {activeSection === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
                <p className="text-gray-600 mt-2">Quick stats and recent activity will appear here.</p>
              </div>
            )}

            {activeSection === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
                <p className="text-gray-600 mt-2">Manage bookings (integration coming soon).</p>
              </div>
            )}

            {activeSection === 'chat' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Support Chat</h2>
                <p className="text-gray-600 mt-2">Open the live chat interface to assist users.</p>
                <button
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  onClick={() => navigate('/admin/live-chat')}
                >
                  Open Live Chat
                </button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="text-gray-600 mt-2">View and manage admin notifications.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;