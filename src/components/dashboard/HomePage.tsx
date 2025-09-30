import { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  Shirt, 
  MessageSquare, 
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Bell
} from "lucide-react";
import { useSupabaseData } from "../../contexts/SupabaseDataContext";
import { useRealtimeData } from "../../hooks/useRealtimeData";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { state: { currentUser } } = useSupabaseData();
  
  // Use real-time data for bookings and notifications
  const { data: allBookings, loading: bookingsLoading, error: bookingsError } = useRealtimeData('bookings');
  const { data: allNotifications, loading: notificationsLoading, error: notificationsError } = useRealtimeData('notifications');
  
  // Filter data for current user
  const bookings = allBookings.filter(booking => booking.user_id === currentUser?.id);
  const notifications = allNotifications.filter(notification => notification.user_id === currentUser?.id);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user's first name from real data
  const userName = currentUser?.firstName || currentUser?.full_name?.split(' ')[0] || 'User';

  // Calculate real active services data
  const activeServices = {
    dryCleaningOrders: bookings.filter(booking => 
      booking.service_type === 'dry_cleaning' && 
      ['pending', 'confirmed', 'in_progress'].includes(booking.status)
    ).length,
    upcomingInspections: bookings.filter(booking => 
      booking.service_type === 'inspection' && 
      booking.status === 'confirmed' &&
      new Date(booking.service_date) > new Date()
    ).length,
    pendingReviews: bookings.filter(booking => 
      booking.status === 'completed' && 
      !booking.notes // Assuming no notes means no review yet
    ).length
  };

  // Generate recent activity from real bookings and notifications
  const recentActivity = [
    ...bookings
      .filter(booking => booking.user_id === currentUser?.id)
      .slice(0, 2)
      .map(booking => ({
        id: booking.id,
        type: booking.service_type,
        title: `${booking.service_name} #${booking.id.slice(-6).toUpperCase()}`,
        status: booking.status === 'pending' ? 'Pending Confirmation' :
                booking.status === 'confirmed' ? 'Confirmed' :
                booking.status === 'in_progress' ? 'In Progress' :
                booking.status === 'completed' ? 'Completed' : 'Cancelled',
        time: new Date(booking.created_at).toLocaleDateString(),
        icon: booking.service_type === 'dry_cleaning' ? Shirt : ClipboardCheck,
        color: booking.service_type === 'dry_cleaning' ? "text-blue-600" : "text-green-600"
      })),
    ...notifications
      .filter(notification => notification.user_id === currentUser?.id)
      .slice(0, 1)
      .map(notification => ({
        id: notification.id,
        type: "notification",
        title: notification.title,
        status: notification.message,
        time: new Date(notification.created_at).toLocaleDateString(),
        icon: Bell,
        color: "text-purple-600"
      }))
  ].slice(0, 3);

  const quickActions = [
    {
      id: "book-inspection",
      title: "Book Inspection",
      description: "Schedule a property inspection",
      icon: ClipboardCheck,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => onNavigate("inspection")
    },
    {
      id: "request-pickup",
      title: "Request Pickup",
      description: "Schedule dry cleaning pickup",
      icon: Truck,
      color: "bg-green-500 hover:bg-green-600",
      action: () => onNavigate("dry-cleaning")
    },
    {
      id: "support",
      title: "Support",
      description: "Get help from our team",
      icon: MessageSquare,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => onNavigate("support")
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Show loading state if either bookings or notifications are loading
  if (bookingsLoading || notificationsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-blue-100">
              Welcome back to your Neatrix dashboard. Here's what's happening with your services.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-200">Current Time</p>
              <p className="text-lg font-semibold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Dry Cleaning</p>
              <p className="text-2xl font-bold text-gray-900">{activeServices.dryCleaningOrders}</p>
              <p className="text-sm text-gray-500">Orders in progress</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shirt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <button
            onClick={() => onNavigate("dry-cleaning")}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View Details <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Inspections</p>
              <p className="text-2xl font-bold text-gray-900">{activeServices.upcomingInspections}</p>
              <p className="text-sm text-gray-500">Scheduled this week</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <button
            onClick={() => onNavigate("inspection")}
            className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
          >
            View Schedule <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{activeServices.pendingReviews}</p>
              <p className="text-sm text-gray-500">Services to review</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <button
            onClick={() => onNavigate("reviews")}
            className="mt-4 text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
          >
            Leave Review <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg transition-colors text-left`}
              >
                <Icon className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full bg-gray-100`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips & Updates */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-purple-100 rounded-full">
            <Bell className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
            <p className="text-gray-700 text-sm">
              Schedule your dry cleaning pickups in advance to ensure same-day service. 
              Our team is available Monday through Saturday from 8 AM to 6 PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;