import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabase';
import MessengerOrderTracking from '../components/MessengerOrderTracking';
import NotificationsPage from '../components/NotificationsPage';
import AdminLiveChat from './AdminLiveChat';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  LogOut,
  Home,
  Truck,
  CreditCard,
  BarChart3,
  MapPin,
  Mail,
  MessageSquare,
  AlertTriangle,
  Star,
  Package,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  ShoppingBag,
  UserCheck,
  CreditCard as PaymentIcon,
  Repeat,
  Shirt,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  X
} from 'lucide-react';
import OrderDetails from '../components/OrderDetails';
import { useToast } from '../hooks/use-toast';

// Custom CSS for hiding scrollbars
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarHideStyle;
  document.head.appendChild(style);
}

export default function AdminDashboard() {
  console.log('AdminDashboard component rendering...');
  
  const { 
    state, 
    signOut,
    fetchContactMessages, 
    updateContactMessage, 
    deleteContactMessage,
    updateBooking, 
    deleteBooking,
    fetchAllUsers,
    fetchAllBookings,
    updateUser,
    deleteUser,
    fetchPickupDeliveries,
    createPickupDelivery,
    updatePickupDelivery,
    fetchUserComplaints,
    createUserComplaint,
    updateUserComplaint,
    fetchAdminNotifications,
    updateAdminNotification,
    markNotificationAsRead,
    fetchLaundryOrders,
    fetchPayments,
    fetchSubscriptions,
    fetchReviews,
    fetchSupportTickets,
    fetchSupportMessages,
    updateSupportTicket,
    sendSupportMessage,
    markMessageAsRead
  } = useSupabaseData();
  
  console.log('AdminDashboard state:', { 
    loading: state.loading, 
    error: state.error, 
    isAuthenticated: state.isAuthenticated, 
    authUser: state.authUser,
    stats: state.stats 
  });
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [selectedContactMessage, setSelectedContactMessage] = useState(null);
  const [showContactChat, setShowContactChat] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  // Modal state for booking details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Toast hook
  const { toast } = useToast();
  
  // Settings state management
  const [settings, setSettings] = useState({
    businessName: 'CleanPro Services',
    contactEmail: 'admin@cleanpro.com',
    phoneNumber: '+1 (555) 123-4567',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    defaultServiceDuration: 2,
    bookingLeadTime: 24,
    autoConfirmBookings: false,
    currency: 'USD',
    timeZone: 'America/New_York',
    maintenanceMode: false
  });
  
  const [originalSettings, setOriginalSettings] = useState({ ...settings });
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  // Order tracking state
  const [trackingOrders, setTrackingOrders] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState({ type: '', text: '' });

  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!state.isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [state.isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      navigate('/login');
    }
  };

  // Fetch all admin data on component mount (sequential to reduce burst)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        await fetchAllUsers();
        await fetchAllBookings();
        await fetchContactMessages();
        await fetchPayments();
        await fetchSubscriptions();
        await fetchLaundryOrders();
        await fetchPickupDeliveries();
        await fetchUserComplaints();
        await fetchAdminNotifications();
        await fetchReviews();
        await fetchSupportTickets();
        await fetchSupportMessages();
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };
    fetchAdminData();
  }, [
    fetchContactMessages,
    fetchAllUsers,
    fetchAllBookings,
    fetchPickupDeliveries,
    fetchUserComplaints,
    fetchAdminNotifications,
    fetchPayments,
    fetchSubscriptions,
    fetchLaundryOrders,
    fetchReviews,
    fetchSupportTickets,
    fetchSupportMessages
  ]);

  // Handle notification actions
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Contact message handlers
  const handleContactMessageClick = (message: any) => {
    setSelectedContactMessage(message);
    setShowContactChat(true);
  };

  const handleDeleteContactMessage = (message: any) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      try {
        await deleteContactMessage(messageToDelete.id);
        setShowDeleteConfirm(false);
        setMessageToDelete(null);
        // Close chat if the deleted message was selected
        if (selectedContactMessage?.id === messageToDelete.id) {
          setShowContactChat(false);
          setSelectedContactMessage(null);
        }
      } catch (error) {
        console.error('Error deleting contact message:', error);
      }
    }
  };

  const cancelDeleteMessage = () => {
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };

  // Settings handlers
  const handleSettingsChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any existing messages when user makes changes
    if (settingsMessage.text) {
      setSettingsMessage({ type: '', text: '' });
    }
  };

  const handleSaveSettings = async () => {
    setIsSettingsLoading(true);
    setSettingsMessage({ type: '', text: '' });
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update original settings to reflect saved state
      setOriginalSettings({ ...settings });
      
      setSettingsMessage({ 
        type: 'success', 
        text: 'Settings saved successfully!' 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSettingsMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSettingsMessage({ 
        type: 'error', 
        text: 'Failed to save settings. Please try again.' 
      });
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      businessName: 'CleanPro Services',
      contactEmail: 'admin@cleanpro.com',
      phoneNumber: '+1 (555) 123-4567',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      defaultServiceDuration: 2,
      bookingLeadTime: 24,
      autoConfirmBookings: false,
      currency: 'USD',
      timeZone: 'America/New_York',
      maintenanceMode: false
    };
    
    setSettings(defaultSettings);
    setSettingsMessage({ 
      type: 'info', 
      text: 'Settings reset to default values. Click "Save Changes" to apply.' 
    });
    
    // Clear info message after 4 seconds
    setTimeout(() => {
      setSettingsMessage({ type: '', text: '' });
    }, 4000);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await updateAdminNotification(notificationId, { status: 'archived' });
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = state.bookings.filter(booking => {
    const serviceName = (booking.service_name || '').toLowerCase();
    const phone = (booking.phone || '').toLowerCase();
    const address = (booking.address || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = serviceName.includes(term) || phone.includes(term) || address.includes(term);
    const normalizedFilter = filterStatus === 'in-progress' ? 'in_progress' : filterStatus;
    const matchesStatus = normalizedFilter === 'all' || booking.status === normalizedFilter;
    return matchesSearch && matchesStatus;
  });

  // Get recent activities
  const recentActivities = [
    ...state.bookings.slice(-5).map(booking => ({
      id: booking.id,
      type: 'booking' as const,
      message: `New booking for ${booking.service_name}`,
      time: booking.created_at,
      status: booking.status
    })),
    ...state.contactMessages.slice(-3).map(message => ({
      id: message.id,
      type: 'contact' as const,
      message: `New contact message from ${message.name}`,
      time: message.created_at,
      status: message.status
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateBooking(bookingId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  // Modal handlers
  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const handleOrderUpdate = () => {
    // Refresh bookings after update
    fetchAllBookings();
  };

  // Toast wrapper for OrderDetails component
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const variant: 'default' | 'destructive' = type === 'error' ? 'destructive' : 'default';
    const title = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info';
    toast({
      title,
      description: message,
      variant,
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300 w-full min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 truncate">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 break-words">{value}</p>
          {trend && (
            <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
              trend > 0 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span className="whitespace-nowrap">{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 sm:p-3 lg:p-3.5 rounded-xl ${color} shadow-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
      {/* Real-time Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`p-2 rounded-xl shadow-lg flex-shrink-0 ${state.realTimeConnected ? 'bg-green-500' : 'bg-red-500'}`}>
              {state.realTimeConnected ? (
                <Wifi className="w-5 h-5 text-white" />
              ) : (
                <WifiOff className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Real-time Status</h3>
              <p className={`text-sm truncate ${state.realTimeConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {state.realTimeConnected ? 'Connected - Live updates active' : 'Disconnected - Data may be outdated'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${state.realTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {state.realTimeConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid - Core Business Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        <StatCard
          title="Total Bookings"
          value={state.stats.totalBookings}
          icon={Calendar}
          trend={12}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(state.stats.totalRevenue)}
          icon={DollarSign}
          trend={8}
          color="bg-green-500"
        />
        <StatCard
          title="Active Subscriptions"
          value={state.subscriptions.filter(sub => sub.status === 'active').length}
          icon={Repeat}
          trend={22}
          color="bg-cyan-500"
        />
      </div>

      {/* Secondary Stats Grid - Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        <StatCard
          title="Total Payments"
          value={state.payments.length}
          icon={CreditCard}
          trend={15}
          color="bg-emerald-500"
        />
        <StatCard
          title="Active Users"
          value={state.stats.activeUsers}
          icon={Users}
          trend={5}
          color="bg-purple-500"
        />
        <StatCard
          title="Laundry Orders"
          value={state.laundryOrders.length}
          icon={Shirt}
          trend={18}
          color="bg-teal-500"
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  activity.type === 'booking' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(activity.time)}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                  activity.status === 'completed'
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                    : activity.status === 'pending'
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800'
                    : activity.status === 'in_progress'
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                    : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={() => {
              const csvData = state.bookings.map(booking => ({
                ID: booking.id,
                Customer: booking.userName || 'N/A',
                Service: booking.service_name,
                Date: formatDate(booking.date),
                Time: booking.time,
                Status: booking.status,
                Amount: formatCurrency(booking.total_amount),
                Created: formatDate(booking.created_at)
              }));
              
              const csvContent = [
                Object.keys(csvData[0] || {}).join(','),
                ...csvData.map(row => Object.values(row).join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight mb-1">
                  {booking.userName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                  {booking.userEmail}
                </p>
              </div>
              <select
                value={booking.status}
                onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                className={`px-3 py-2 text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[120px] ${
                  booking.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : booking.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : booking.status === 'confirmed'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="space-y-4 mb-5">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Service:</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium text-right flex-1 ml-3">{booking.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Date:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{formatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Time:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{booking.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Amount:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white text-right">{formatCurrency(booking.amount)}</span>
              </div>
              {booking.address && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Address:</span>
                  <span className="text-sm text-gray-900 dark:text-white text-right flex-1 ml-3 break-words">{booking.address}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => handleViewBooking(booking)}
                className="flex-1 flex items-center justify-center space-x-2 p-3 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px]"
              >
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">View</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 p-3 text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[48px]">
                <Edit className="w-5 h-5" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button 
                onClick={() => handleDeleteBooking(booking.id)}
                className="flex-1 flex items-center justify-center space-x-2 p-3 text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[48px]"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        ))}
        
        {filteredBookings.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Service
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.userName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-white">{booking.service}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.address}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDate(booking.date)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.time}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className={`px-3 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewBooking(booking)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    // Calculate total spent for each user from their bookings
    const usersWithStats = state.users.map(user => {
      const userBookings = state.bookings.filter(booking => booking.user_id === user.id);
      const totalSpent = userBookings
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + booking.total_amount, 0);
      
      return {
        ...user,
        totalSpent,
        totalBookings: userBookings.length,
        status: userBookings.length > 0 ? 'active' : 'inactive'
      };
    });

    return (
      <div className="space-y-4 sm:space-y-6 w-full max-w-full">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">User Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage registered users and view their activity</p>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 w-full max-w-full overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Join Date
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Total Spent
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Bookings
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {usersWithStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 sm:px-4 lg:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="text-gray-400 dark:text-gray-500">No users found</div>
                  </td>
                </tr>
              ) : (
                usersWithStats.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate md:hidden">{user.phone}</div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500 md:hidden mt-1">
                          Joined: {formatDate(user.created_at)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 sm:hidden mt-1">
                          Spent: {formatCurrency(user.totalSpent)}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white hidden sm:table-cell">
                      {formatCurrency(user.totalSpent)}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                      {user.totalBookings}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {user.status}
                      </span>
                      <div className="text-xs text-gray-400 dark:text-gray-500 lg:hidden mt-1">
                        {user.totalBookings} bookings
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button 
                          className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex-shrink-0"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          className="p-1.5 sm:p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors flex-shrink-0"
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          title="Delete User"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                              deleteUser(user.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
      </div>

      {/* Chat Interface Modal */}
      {showChatInterface && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl h-[85vh] sm:h-[70vh] flex flex-col max-h-screen">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700 flex-shrink-0">
              <div className="min-w-0 flex-1 mr-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Chat: #{selectedTicket.ticket_number}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => {
                  setShowChatInterface(false);
                  setSelectedTicket(null);
                }}
                className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg touch-manipulation flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
              <div className="space-y-3 sm:space-y-4">
                {state.supportMessages
                  .filter(msg => msg.ticket_id === selectedTicket.id)
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                          message.sender_type === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <p className="text-sm sm:text-base break-words">{message.message}</p>
                        <span className="text-xs opacity-75 block mt-1">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="p-3 sm:p-4 border-t dark:border-gray-700 flex-shrink-0">
              <div className="flex space-x-2 sm:space-x-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-3 sm:p-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white touch-manipulation"
                />
                <button className="px-3 sm:px-4 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 touch-manipulation flex-shrink-0">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  const renderLiveMessages = () => {
    // Get user info for tickets
    const getTicketUser = (userId: string) => {
      return state.users.find(user => user.id === userId);
    };

    // Get unread message count for a ticket
    const getUnreadCount = (ticketId: string) => {
      return state.supportMessages.filter(msg => 
        msg.ticket_id === ticketId && 
        !msg.is_read && 
        msg.sender_type === 'user'
      ).length;
    };

    // Get latest message for a ticket
    const getLatestMessage = (ticketId: string) => {
      const messages = state.supportMessages
        .filter(msg => msg.ticket_id === ticketId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return messages[0];
    };

    return (
      <div className="w-full overflow-hidden space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Support Messages</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${state.realTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {state.realTimeConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ticket Info
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Latest Message
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {state.supportTickets.map((ticket) => {
                const user = getTicketUser(ticket.user_id);
                const unreadCount = getUnreadCount(ticket.id);
                const latestMessage = getLatestMessage(ticket.id);
                
                return (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowChatInterface(true);
                    }}
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            #{ticket.ticket_number}
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{ticket.subject}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user ? user.full_name || user.email : 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(ticket.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs sm:max-w-sm">
                        {latestMessage ? (
                          <div>
                            <div className="truncate">{latestMessage.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {latestMessage.sender_type === 'user' ? 'Customer' : 'Admin'} • {formatDate(latestMessage.created_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No messages yet</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.priority === 'urgent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : ticket.priority === 'normal'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.status === 'open'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : ticket.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : ticket.status === 'resolved'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button 
                          onClick={() => navigate('/admin-live-chat')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          title="Open chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        {ticket.status === 'open' && (
                          <button 
                            onClick={() => updateSupportTicket(ticket.id, { status: 'in_progress' })}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1"
                            title="Mark in progress"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                          <button 
                            onClick={() => updateSupportTicket(ticket.id, { status: 'resolved' })}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                            title="Mark resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
          {state.supportTickets.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No support tickets yet.
            </div>
          )}
        </div>

        {/* Contact Chat Interface */}
        {showContactChat && selectedContactMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Message Chat
                </h3>
                <button
                  onClick={() => {
                    setShowContactChat(false);
                    setSelectedContactMessage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AdminLiveChat
                  mode="contact"
                  contactMessages={state.contactMessages || []}
                  selectedContactMessage={selectedContactMessage}
                  onContactMessageSelect={(message) => setSelectedContactMessage(message)}
                  onContactMessageUpdate={async (messageId, status) => {
                    await updateContactMessage(messageId, { status });
                  }}
                  onContactMessageDelete={(message) => {
                    handleDeleteContactMessage(message);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContactMessages = () => {
    const filteredMessages = state.contactMessages?.filter(message => {
      const matchesSearch = searchTerm === '' || 
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || message.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    }) || [];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage contact form submissions</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMessages.map((message) => (
                  <tr 
                    key={message.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleContactMessageClick(message)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {message.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {message.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {message.subject}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.status === 'new' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : message.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {message.status === 'new' ? 'New' : 
                         message.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactMessageClick(message);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContactMessage(message);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMessages.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No contact messages found.
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && messageToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Contact Message
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete the message from <strong>{messageToDelete.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteMessage}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMessage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    const handleNotificationClick = (notification: any) => {
      // Mark notification as read
      handleMarkAsRead(notification.id);
      
      // Route to relevant page based on notification type
      switch (notification.type) {
        case 'booking':
          setActiveTab('bookings');
          break;
        case 'payment':
          setActiveTab('payments');
          break;
        case 'user':
          setActiveTab('users');
          break;
        case 'complaint':
        case 'support':
          setActiveTab('contacts');
          break;
        case 'review':
          setActiveTab('reviews');
          break;
        case 'delivery':
          setActiveTab('delivery');
          break;
        case 'laundry':
          setActiveTab('laundry');
          break;
        default:
          setActiveTab('overview');
      }
    };

    return (
      <NotificationsPage
        notifications={state.adminNotifications || []}
        realTimeConnected={state.realTimeConnected}
        onNotificationClick={handleNotificationClick}
        onDeleteNotification={handleDeleteNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    );
  };

  const renderPayments = () => (
    <div className="w-full overflow-hidden space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-3 sm:p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Management</h3>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Payment data will be available when payment system is integrated */}
            </tbody>
          </table>
        </div>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Payment system integration coming soon.
        </div>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pickup & Delivery Management</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage pickup and delivery operations</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                alert('Schedule Pickup feature coming soon! This will open a modal to schedule new pickups.');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Truck className="w-4 h-4" />
              <span>Schedule Pickup</span>
            </button>
            <button 
              onClick={() => {
                if (state.pickupDeliveries.length === 0) {
                  alert('No deliveries to track. Create some pickup/delivery records first.');
                } else {
                  alert(`Tracking ${state.pickupDeliveries.length} active deliveries. Full tracking interface coming soon!`);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <MapPin className="w-4 h-4" />
              <span>Track Delivery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Pickups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.pickupDeliveries.filter(d => d.type === 'pickup' && d.status === 'scheduled').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Transit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.pickupDeliveries.filter(d => d.status === 'in_transit').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.pickupDeliveries.filter(d => d.status === 'completed' && new Date(d.actual_date || d.scheduled_date).toDateString() === new Date().toDateString()).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.pickupDeliveries.filter(d => d.status === 'scheduled').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Pickup & Deliveries</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.pickupDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Truck className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No pickup/delivery records found</p>
                      <p className="text-sm">Schedule your first pickup or delivery to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.pickupDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{delivery.customerName}</div>
                        <div className="text-sm text-gray-500">{delivery.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        delivery.type === 'pickup'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {delivery.type === 'pickup' ? 'Pickup' : 'Delivery'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.type === 'pickup' ? delivery.pickup_address : delivery.delivery_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(delivery.scheduled_date)}</div>
                      <div className="text-sm text-gray-500">{delivery.scheduled_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{delivery.driver_name || 'Not assigned'}</div>
                      {delivery.driver_phone && (
                        <div className="text-sm text-gray-500">{delivery.driver_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        delivery.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : delivery.status === 'in_transit'
                          ? 'bg-blue-100 text-blue-800'
                          : delivery.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900" title="Track">
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  const renderOrderTracking = () => (
    <MessengerOrderTracking />
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure system settings and preferences</p>
        </div>
      </div>

      {/* Settings Message */}
      {settingsMessage.text && (
        <div className={`p-4 rounded-lg border ${
          settingsMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : settingsMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
        }`}>
          <div className="flex items-center">
            {settingsMessage.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {settingsMessage.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
            {settingsMessage.type === 'info' && <AlertTriangle className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{settingsMessage.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => handleSettingsChange('businessName', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] transition-colors"
                placeholder="Enter business name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] transition-colors"
                placeholder="Enter contact email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phoneNumber}
                onChange={(e) => handleSettingsChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] transition-colors"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 pr-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Email Notifications</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive email alerts for new bookings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 pr-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">SMS Notifications</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive SMS alerts for urgent matters</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingsChange('smsNotifications', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 pr-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Push Notifications</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Browser push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Service Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Service Duration (hours)
              </label>
              <input
                type="number"
                value={settings.defaultServiceDuration}
                onChange={(e) => handleSettingsChange('defaultServiceDuration', parseInt(e.target.value))}
                min="1"
                max="8"
                placeholder="e.g., 2"
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Booking Lead Time (hours)
              </label>
              <input
                type="number"
                value={settings.bookingLeadTime}
                onChange={(e) => handleSettingsChange('bookingLeadTime', parseInt(e.target.value))}
                min="1"
                placeholder="e.g., 24"
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 pr-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Auto-confirm bookings</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically confirm new bookings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoConfirmBookings}
                  onChange={(e) => handleSettingsChange('autoConfirmBookings', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select 
                value={settings.currency}
                onChange={(e) => handleSettingsChange('currency', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white dark:bg-gray-700"
              >
                 <option value="USD">USD ($)</option>
                 <option value="EUR">EUR (€)</option>
                 <option value="GBP">GBP (£)</option>
                 <option value="NGN">NGN (₦)</option>
               </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Zone
              </label>
              <select 
                value={settings.timeZone}
                onChange={(e) => handleSettingsChange('timeZone', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white dark:bg-gray-700"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 pr-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Maintenance Mode</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Temporarily disable booking system</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingsChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button 
          onClick={handleResetSettings}
          disabled={isSettingsLoading}
          className="px-6 py-3 text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[48px] font-medium"
        >
          Reset to Defaults
        </button>
        <button 
          onClick={handleSaveSettings}
          disabled={isSettingsLoading}
          className="flex items-center justify-center px-6 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px] font-medium"
        >
          {isSettingsLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="w-full overflow-hidden space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customer subscription plans</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            state.realTimeConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {state.realTimeConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{state.realTimeConnected ? 'Live' : 'Offline'}</span>
          </div>
          <button 
            onClick={() => fetchAdminNotifications()}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Repeat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(state.subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.subscriptions.filter(s => {
                   const expiryDate = new Date(s.next_billing_date);
                   const today = new Date();
                   const diffTime = expiryDate.getTime() - today.getTime();
                   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                   return diffDays <= 7 && diffDays > 0;
                 }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.subscriptions.filter(s => s.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Billing</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {state.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Repeat className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.subscriptions.slice(0, 10).map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{subscription.customerName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{subscription.customerEmail}</div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900 dark:text-white">{subscription.plan_name}</div>
                       <div className="text-sm text-gray-500 dark:text-gray-400">{subscription.billing_cycle}</div>
                     </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(subscription.amount)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : subscription.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                       {formatDate(subscription.next_billing_date)}
                     </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLaundryOrders = () => (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Laundry Orders</h2>
            <p className="text-gray-600 dark:text-gray-400">Track laundry and dry cleaning orders</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              state.realTimeConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {state.realTimeConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{state.realTimeConnected ? 'Live' : 'Offline'}</span>
            </div>
            <button 
              onClick={async () => {
                try {
                  await fetchLaundryOrders();
                  alert('Laundry orders refreshed successfully!');
                } catch (error) {
                  alert('Failed to refresh laundry orders. Please try again.');
                }
              }}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <Shirt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{state.laundryOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {state.laundryOrders.filter(order => 
                  order.status === 'pending' || 
                  order.status === 'in_progress' || 
                  order.status === 'ready_for_pickup'
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed Today</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                 {state.laundryOrders.filter(order => {
                   const today = new Date().toDateString();
                   return order.status === 'delivered' && new Date(order.updated_at || '').toDateString() === today;
                 }).length}
               </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Revenue Today</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                 {formatCurrency(state.laundryOrders.filter(order => {
                   const today = new Date().toDateString();
                   return order.status === 'delivered' && new Date(order.updated_at || '').toDateString() === today;
                 }).reduce((sum, order) => sum + order.total_amount, 0))}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 w-full max-w-full overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {state.laundryOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Shirt className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No laundry orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.laundryOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.order_number}</div>
                     </td>
                     <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                       <div className="min-w-0">
                         <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.customer_name}</div>
                         <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{order.customer_phone}</div>
                       </div>
                     </td>
                     <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900 dark:text-white">{order.service_type}</div>
                     </td>
                     <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900 dark:text-white">{order.item_count} items</div>
                     </td>
                     <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</div>
                     </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : order.status === 'ready_for_pickup'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  const renderReviews = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews & Feedback</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customer reviews and ratings</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            state.realTimeConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {state.realTimeConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{state.realTimeConnected ? 'Live' : 'Offline'}</span>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.stats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Positive Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.reviews.filter(review => review.rating >= 4).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reviews</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {state.reviews.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
              </div>
            </div>
          ) : (
            state.reviews.slice(0, 10).map((review) => (
              <div key={review.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {review.customerName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{review.customerName || 'Unknown Customer'}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                        <div className="mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            review.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : review.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {review.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Service: {review.serviceName || 'Unknown Service'}
                      </div>
                      <div className="flex space-x-2">
                        {review.status === 'pending' && (
                          <>
                            <button className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs">
                              <ThumbsDown className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-xs">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Home className="w-6 h-6 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Cleaning Service Management</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => setActiveTab('notifications')}
                className="relative p-2.5 sm:p-2 text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Bell className="w-5 h-5 sm:w-5 sm:h-5" />
                {state.adminNotifications && state.adminNotifications.filter(n => n.status === 'unread').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {state.adminNotifications.filter(n => n.status === 'unread').length}
                  </span>
                )}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 sm:p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1 w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full min-w-0">
          {/* Sidebar */}
          <div className="lg:w-72">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2">Navigation</h2>
                <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              </div>
              
              {/* Mobile: Comprehensive grid navigation */}
              <div className="lg:hidden">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto scrollbar-hide">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
                    { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-green-500 to-green-600' },
                    { id: 'users', label: 'Users', icon: Users, color: 'from-purple-500 to-purple-600' },
                    { id: 'contacts', label: 'Messages', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
                    { id: 'notifications', label: 'Alerts', icon: Bell, color: 'from-red-500 to-red-600' },
                    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-emerald-500 to-emerald-600' },
                    { id: 'subscriptions', label: 'Subs', icon: Repeat, color: 'from-cyan-500 to-cyan-600' },
                    { id: 'laundry', label: 'Laundry', icon: Shirt, color: 'from-teal-500 to-teal-600' },
                    { id: 'tracking', label: 'Tracking', icon: Package, color: 'from-indigo-500 to-indigo-600' },
                    { id: 'delivery', label: 'Delivery', icon: Truck, color: 'from-indigo-500 to-indigo-600' },
                    { id: 'reviews', label: 'Reviews', icon: Star, color: 'from-yellow-500 to-yellow-600' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center justify-center space-y-2 p-3 rounded-xl text-center transition-all duration-200 min-h-[80px] touch-manipulation active:scale-95 ${
                        activeTab === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700 shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        activeTab === item.id 
                          ? `bg-gradient-to-r ${item.color} shadow-sm` 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          activeTab === item.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <span className="text-xs font-medium leading-tight px-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop: Vertical navigation */}
              <ul className="space-y-3 hidden lg:block">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
                  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-green-500 to-green-600' },
                  { id: 'users', label: 'Users', icon: Users, color: 'from-purple-500 to-purple-600' },
                  { id: 'contacts', label: 'Contact Messages', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
                  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-red-500 to-red-600' },
                  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-emerald-500 to-emerald-600' },
                  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, color: 'from-cyan-500 to-cyan-600' },
                  { id: 'laundry', label: 'Laundry Orders', icon: Shirt, color: 'from-teal-500 to-teal-600' },
                  { id: 'tracking', label: 'Order Tracking', icon: Package, color: 'from-indigo-500 to-indigo-600' },
                  { id: 'delivery', label: 'Pickup & Delivery', icon: Truck, color: 'from-indigo-500 to-indigo-600' },
                  { id: 'reviews', label: 'Reviews & Feedback', icon: Star, color: 'from-yellow-500 to-yellow-600' },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg border border-blue-200/50 scale-105'
                          : 'text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === item.id 
                          ? `bg-gradient-to-r ${item.color} shadow-lg` 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      } transition-all duration-200`}>
                        <item.icon className={`w-5 h-5 ${
                          activeTab === item.id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full overflow-hidden">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 sm:p-4 lg:p-6 min-h-[500px] sm:min-h-[600px] overflow-auto w-full">
              {activeTab === 'overview' && renderOverview()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'contacts' && renderContactMessages()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'subscriptions' && renderSubscriptions()}
        {activeTab === 'laundry' && renderLaundryOrders()}
        {activeTab === 'delivery' && renderDelivery()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'tracking' && renderOrderTracking()}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <OrderDetails
                order={selectedBooking}
                onOrderUpdate={handleOrderUpdate}
                showToast={showToast}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}