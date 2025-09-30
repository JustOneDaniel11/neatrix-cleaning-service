import { ReactNode } from "react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Neatrix</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Support Icon */}
          <button
            onClick={() => handleTabChange('support')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'support'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
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
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Neatrix Dashboard</h1>
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
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      activeTab === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
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
          <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeTab === 'dry-cleaning' ? 'Dry Cleaning' : 
                   activeTab === 'inspection' ? 'Book Inspection' : 
                   activeTab}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                {/* Support Icon */}
                <button
                  onClick={() => handleTabChange('support')}
                  className={`p-2 rounded-full transition-colors ${
                    activeTab === 'support'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
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
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
              <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
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
                    ? 'text-blue-600 bg-blue-50 scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <span className={`text-xs font-medium truncate ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
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