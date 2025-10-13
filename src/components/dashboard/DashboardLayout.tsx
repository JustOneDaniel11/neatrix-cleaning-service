import { ReactNode, useEffect } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { 
  Home, 
  Shirt, 
  ClipboardCheck, 
  MessageSquare, 
  User,
  Star,
  Bell,
  CreditCard,
  Headphones
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const { isDarkMode, toggleDarkMode, setDarkMode } = useDarkMode();

  // On first dashboard visit, default to dark if no saved preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === null) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  // Apply/remove global dark class while on dashboard, and cleanup on unmount
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => {
      root.classList.remove('dark');
    };
  }, [isDarkMode]);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dry-cleaning', label: 'Dry Cleaning', icon: Shirt },
    { id: 'inspection', label: 'Book Inspection', icon: ClipboardCheck },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  // Mobile bottom navigation with Payment and Notifications
  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dry-cleaning', label: 'Services', icon: Shirt },
    { id: 'inspection', label: 'Book', icon: ClipboardCheck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-secondary border-b border-gray-200 dark:border-secondary px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-foreground">Neatrix</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-colors text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-secondary"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              // Moon icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.752 15.002A9.718 9.718 0 0112 21.75 9.75 9.75 0 1112 2.25c.46 0 .912.035 1.353.103a.75.75 0 01.204 1.44 7.5 7.5 0 106.702 9.209.75.75 0 011.493-.004z" />
              </svg>
            ) : (
              // Sun icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V4.5A.75.75 0 0112 3.75zm0 14.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V18.75a.75.75 0 01.75-.75zM4.5 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 12zm12.75 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM6.22 6.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L6.22 7.28a.75.75 0 010-1.06zm9.44 9.44a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm0-8.38a.75.75 0 010 1.06L14.6 9.5a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM9.5 14.6a.75.75 0 010 1.06L8.44 16.72a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm2.5-7.1a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            )}
          </button>
          {/* Support Icon */}
          <button
            onClick={() => handleTabChange('support')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'support'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-secondary'
            }`}
          >
            <Headphones className="w-5 h-5" />
          </button>
          
          {/* Profile Icon */}
          <button
            onClick={() => handleTabChange('profile')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-secondary border-r border-gray-200 dark:border-secondary">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-foreground">Neatrix Dashboard</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-secondary dark:hover:text-foreground'
                    }`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      activeTab === item.id ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400'
                    }`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>



        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white dark:bg-secondary border-b border-gray-200 dark:border-secondary px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground capitalize">
                  {activeTab === 'dry-cleaning' ? 'Dry Cleaning' : 
                   activeTab === 'inspection' ? 'Book Inspection' : 
                   activeTab}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full transition-colors text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-secondary"
                  title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M21.752 15.002A9.718 9.718 0 0112 21.75 9.75 9.75 0 1112 2.25c.46 0 .912.035 1.353.103a.75.75 0 01.204 1.44 7.5 7.5 0 106.702 9.209.75.75 0 011.493-.004z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V4.5A.75.75 0 0112 3.75zm0 14.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V18.75a.75.75 0 01.75-.75zM4.5 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 12zm12.75 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM6.22 6.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L6.22 7.28a.75.75 0 010-1.06zm9.44 9.44a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm0-8.38a.75.75 0 010 1.06L14.6 9.5a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM9.5 14.6a.75.75 0 010 1.06L8.44 16.72a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm2.5-7.1a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                    </svg>
                  )}
                </button>
                {/* Support Icon */}
                <button
                  onClick={() => handleTabChange('support')}
                  className={`p-2 rounded-full transition-colors ${
                    activeTab === 'support'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-secondary'
                  }`}
                  title="Support"
                >
                  <Headphones className="w-5 h-5" />
                </button>
                
                {/* Profile Icon */}
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-secondary dark:text-gray-300'
                  }`}
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <main className="flex-1 pb-24 lg:pb-8">
            <div className="py-4 lg:py-6">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-foreground">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary border-t border-gray-200 dark:border-secondary px-2 py-2 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center py-3 px-3 rounded-xl transition-all duration-200 touch-manipulation min-w-0 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 scale-105 dark:text-blue-300 dark:bg-blue-900/30'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-secondary'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-300'
                }`} />
                <span className={`text-xs font-medium truncate ${
                  isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-300'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        

      </div>
    </div>
  );
};

export default DashboardLayout;