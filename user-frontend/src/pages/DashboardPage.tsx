import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import HomePage from "@/components/dashboard/HomePage";
import DryCleaningPage from "@/components/dashboard/DryCleaningPage";
import BookInspectionPage from "@/components/dashboard/BookInspectionPage";


import SupportPage from "@/components/dashboard/SupportPage";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import PaymentPage from "@/components/dashboard/PaymentPage";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";

// Resolve active tab from a given pathname
function resolveTabFromPath(pathname: string): string {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'home';
  const tabFromPath = pathname.replace('/dashboard/', '');
  switch (tabFromPath) {
    case 'home': return 'home';
    case 'dry-cleaning': return 'dry-cleaning';
    case 'book-inspection': return 'inspection';
    case 'reviews-feedback': return 'reviews';
    case 'support': return 'support';
    case 'profile': return 'profile';
    case 'payment': return 'payment';
    case 'notifications': return 'notifications';
    default: return 'home';
  }
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(() => resolveTabFromPath(location.pathname));

  // Sync activeTab with URL changes
  useEffect(() => {
    setActiveTab(resolveTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Map tab IDs to URL paths
    const pathMap: { [key: string]: string } = {
      'home': '/dashboard/home',
      'dry-cleaning': '/dashboard/dry-cleaning',
      'inspection': '/dashboard/book-inspection',
      'reviews': '/support', // Redirect to new support page
      'support': '/dashboard/support',
      'profile': '/dashboard/profile',
      'payment': '/dashboard/payment',
      'notifications': '/dashboard/notifications'
    };
    
    const path = pathMap[tabId] || '/dashboard/home';
    navigate(path);
  };

  const handleNavigate = (tab: string) => {
    handleTabChange(tab);
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
        <Route path="/home" element={<HomePage onNavigate={handleNavigate} />} />
        <Route path="/dry-cleaning" element={<DryCleaningPage />} />
        <Route path="/book-inspection" element={<BookInspectionPage />} />


        <Route path="/support" element={<SupportPage />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;