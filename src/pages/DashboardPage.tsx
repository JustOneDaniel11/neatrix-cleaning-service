import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import HomePage from "@/components/dashboard/HomePage";
import DryCleaningPage from "@/components/dashboard/DryCleaningPage";
import BookInspectionPage from "@/components/dashboard/BookInspectionPage";
import ReviewsFeedback from "@/components/dashboard/ReviewsFeedback";
import PaymentPage from "@/components/dashboard/PaymentPage";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";
import SupportPage from "@/components/dashboard/SupportPage";
import ProfileSettings from "@/components/dashboard/ProfileSettings";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract tab from URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'home';
    const tabFromPath = path.replace('/dashboard/', '');
    
    // Map URL paths to tab IDs
    switch (tabFromPath) {
      case 'home': return 'home';
      case 'dry-cleaning': return 'dry-cleaning';
      case 'book-inspection': return 'inspection';
      case 'reviews-feedback': return 'reviews';
      case 'payment': return 'payment';
      case 'notifications': return 'notifications';
      case 'support': return 'support';
      case 'profile': return 'profile';
      default: return 'home';
    }
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());

  // Sync activeTab with URL changes
  useEffect(() => {
    const newTab = getTabFromPath();
    setActiveTab(newTab);
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Map tab IDs to URL paths
    const pathMap: { [key: string]: string } = {
      'home': '/dashboard/home',
      'dry-cleaning': '/dashboard/dry-cleaning',
      'inspection': '/dashboard/book-inspection',
      'reviews': '/dashboard/reviews-feedback',
      'payment': '/dashboard/payment',
      'notifications': '/dashboard/notifications',
      'support': '/dashboard/support',
      'profile': '/dashboard/profile'
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
        <Route path="/reviews-feedback" element={<ReviewsFeedback />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;