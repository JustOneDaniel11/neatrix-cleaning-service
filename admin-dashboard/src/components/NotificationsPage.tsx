import React from 'react';
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
  Trash2 
} from 'lucide-react';
import { formatDate } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  type?: string;
  priority?: string;
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{todayCount}</p>
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
                  onClick={() => onNotificationClick(notification)}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
    </div>
  );
}