import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  CreditCard, 
  Users, 
  AlertTriangle, 
  Star, 
  Truck, 
  Shirt, 
  Activity, 
  CheckCircle, 
  Trash2,
  X,
  ExternalLink,
  Eye,
  MarkAsRead
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  type?: string;
  priority?: string;
  action_url?: string;
  action_label?: string;
}

interface NotificationsPageProps {
  notifications: Notification[];
  realTimeConnected: boolean;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationsPage({
  notifications,
  realTimeConnected,
  onNotificationClick,
  onDeleteNotification,
  onMarkAsRead
}: NotificationsPageProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    onNotificationClick(notification);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
    if (selectedNotification?.id === id) {
      setSelectedNotification({ ...selectedNotification, status: 'read' });
    }
  };

  const getContextualActionText = (type: string) => {
    switch (type) {
      case 'booking': return { text: 'View Booking Details', icon: Calendar };
      case 'payment': return { text: 'View Payment Details', icon: CreditCard };
      case 'user': return { text: 'View User Profile', icon: Users };
      case 'complaint': 
      case 'support': return { text: 'View Support Ticket', icon: AlertTriangle };
      case 'review': return { text: 'View Review Details', icon: Star };
      case 'delivery': return { text: 'View Delivery Details', icon: Truck };
      case 'laundry': 
      case 'dry_cleaning': return { text: 'View Order Details', icon: Shirt };
      default: return { text: 'View Details', icon: Eye };
    }
  };

  const handleActionClick = (actionUrl?: string, notificationType?: string) => {
    const actionText = getContextualActionText(notificationType || 'general');
    
    if (actionUrl) {
      // Check if it's an internal admin route
      if (actionUrl.startsWith('/admin/')) {
        navigate(actionUrl);
        toast({
          title: "Redirecting...",
          description: `Opening ${actionText.text.toLowerCase()}`,
        });
      } else if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://')) {
        // External URL - open in new tab
        window.open(actionUrl, '_blank');
        toast({
          title: "Opening External Link",
          description: `${actionText.text} opened in new tab`,
        });
      } else {
        // Assume it's an internal route and prepend /admin/
        navigate(`/admin/${actionUrl}`);
        toast({
          title: "Redirecting...",
          description: `Opening ${actionText.text.toLowerCase()}`,
        });
      }
      // Close modal after action
      handleCloseModal();
    } else {
      // Fallback to type-based routing when no action_url is provided
      const routeMap: Record<string, string> = {
        'booking': '/admin/orders',
        'payment': '/admin/payments',
        'user': '/admin/users',
        'complaint': '/admin/contact-message',
        'support': '/admin/contact-message',
        'review': '/admin/reviews',
        'delivery': '/admin/delivery',
        'laundry': '/admin/laundry',
        'dry_cleaning': '/admin/laundry',
      };
      
      const route = routeMap[notificationType || 'general'] || '/admin/dashboard';
      navigate(route);
      toast({
        title: "Redirecting...",
        description: `Opening ${actionText.text.toLowerCase()}`,
      });
      handleCloseModal();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'user': return <Users className="w-5 h-5" />;
      case 'complaint': 
      case 'support': return <AlertTriangle className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'delivery': return <Truck className="w-5 h-5" />;
      case 'laundry': return <Shirt className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const unreadCount = notifications?.filter(n => n.status === 'unread').length || 0;
  const totalCount = notifications?.length || 0;
  const todayCount = notifications?.filter(n => 
    new Date(n.created_at).toDateString() === new Date().toDateString()
  ).length || 0;

  // Separate counts by notification type
  const reviewNotifications = notifications?.filter(n => n.type === 'review') || [];
  const supportNotifications = notifications?.filter(n => n.type === 'support') || [];
  const contactNotifications = notifications?.filter(n => n.type === 'contact') || [];
  const otherNotifications = notifications?.filter(n => !['review', 'support', 'contact'].includes(n.type || '')) || [];

  const reviewCount = reviewNotifications.length;
  const supportCount = supportNotifications.length;
  const contactCount = contactNotifications.length;
  const otherCount = otherNotifications.length;

  return (
    <div className="w-full overflow-hidden space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Stay updated with important alerts and system notifications
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${realTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {realTimeConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviews</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{reviewCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Support</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{supportCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{contactCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{todayCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Other</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{otherCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">Recent Notifications</h4>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                    getNotificationColor(notification.priority || 'low')
                  } ${notification.status === 'unread' ? 'ring-2 ring-blue-500/20' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {getNotificationIcon(notification.type || 'general')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h5>
                        <div className="flex items-center space-x-2">
                          {notification.status === 'unread' && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {notification.priority || 'Low'} Priority
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {notification.status === 'unread' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotification(notification.id);
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm">You'll see important alerts and updates here</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Details Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedNotification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    selectedNotification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {getNotificationIcon(selectedNotification.type || 'general')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedNotification.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedNotification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    selectedNotification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {selectedNotification.priority || 'Low'} Priority
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDate(selectedNotification.created_at)}
                  </span>
                </div>

                <div className="flex space-x-2 pt-4">
                  {selectedNotification.status === 'unread' && (
                    <button
                      onClick={() => handleMarkAsRead(selectedNotification.id)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Mark as Read</span>
                    </button>
                  )}
                  {(() => {
                      const actionInfo = getContextualActionText(selectedNotification.type || 'general');
                      const ActionIcon = actionInfo.icon;
                      return (
                        <button
                          onClick={() => handleActionClick(selectedNotification.action_url, selectedNotification.type)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ActionIcon className="w-4 h-4" />
                          {actionInfo.text}
                        </button>
                      );
                    })()}
                  <button
                    onClick={() => {
                      onDeleteNotification(selectedNotification.id);
                      handleCloseModal();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}