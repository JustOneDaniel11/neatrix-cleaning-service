import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, CheckCircle, Info, Trash2, Mail, ChevronDown, ChevronUp, MessageSquare, Shirt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import type { Notification } from '../../contexts/SupabaseDataContext';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const { state, markNotificationAsRead, updateNotification, deleteNotification: deleteNotificationFromSupabase } = useSupabaseData();
  
  // Use real-time data for notifications
  const { data: allNotifications, loading: notificationsLoading, error: notificationsError } = useRealtimeData<Notification>('notifications');
  
  // Filter notifications for current user
  const notifications = allNotifications.filter(notification => notification.user_id === state.currentUser?.id);

  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'payment' | 'system' | 'support'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />;

      case 'support':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  // Notifications are now loaded via useRealtimeData hook



  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'unread');
      await Promise.all(
        unreadNotifications.map(notification => 
          updateNotification(notification.id, { status: 'read' })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Promise.all(
        notifications.map(notification => deleteNotificationFromSupabase(notification.id))
      );
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    // If it's a support notification, redirect to Support Page
    if (notification && notification.type === 'support') {
      navigate('/dashboard/support');
      return;
    }
    
    // Toggle expanded state
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
    
    // Mark as read when expanded
    if (expandedNotification !== notificationId && notification && notification.status === 'unread') {
      markAsRead(notificationId);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateNotification(notificationId, { status: 'read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      await updateNotification(notificationId, { status: 'unread' });
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationFromSupabase(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const toggleReadStatus = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      if (notification.status === 'read') {
        markAsUnread(notificationId);
      } else {
        markAsRead(notificationId);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.status === 'unread';
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark All Read
            </button>
            <button
              onClick={clearAllNotifications}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'booking', label: 'Booking', count: notifications.filter(n => n.type === 'booking').length },
          { key: 'payment', label: 'Payment', count: notifications.filter(n => n.type === 'payment').length },
          { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
          { key: 'support', label: 'Support', count: notifications.filter(n => n.type === 'support').length }
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notificationsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-300">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? "You're all caught up! New notifications will appear here."
                : `You have no ${filter} notifications at the moment.`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(notification.priority)} rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer ${
                notification.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'support' ? (
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-medium ${notification.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {notification.priority === 'high' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full">
                            High Priority
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTimestamp(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={(e) => toggleReadStatus(e, notification.id)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors"
                      title={notification.status === 'read' ? "Mark as unread" : "Mark as read"}
                    >
                      {notification.status === 'read' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Content */}
                {expandedNotification === notification.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Details</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedNotification(null);
                        }}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Collapse"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Full notification body/content */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-3">
                      <div className="prose prose-sm max-w-none">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          {notification.title}
                        </h4>
                        <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {notification.message || 'No additional details available.'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Notification metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span>
                        <span className="ml-2 capitalize text-gray-900 dark:text-white">{notification.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Priority:</span>
                        <span className={`ml-2 capitalize ${
                          notification.priority === 'urgent' ? 'text-red-600' :
                          notification.priority === 'high' ? 'text-orange-600' :
                          notification.priority === 'normal' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`ml-2 capitalize ${
                          notification.status === 'unread' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {notification.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Received:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action buttons for expanded view */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                      <div className="flex space-x-2">
                        {notification.type === 'support' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/dashboard/support');
                            }}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                          >
                            Go to Support Chat
                          </button>
                        )}
                        {notification.type === 'booking' && notification.metadata?.booking_id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/dashboard/dry-cleaning');
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            View Booking
                          </button>
                        )}
                        {(notification.type === 'dry_cleaning' || notification.type === 'laundry') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/dashboard/dry-cleaning');
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            View Orders
                          </button>
                        )}
                        {notification.type === 'payment' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/dashboard/payment');
                            }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            View Payment
                          </button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => toggleReadStatus(e, notification.id)}
                          className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            notification.status === 'read'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          Mark as {notification.status === 'read' ? 'Unread' : 'Read'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      {notifications.length > 0 && (
        <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-transparent dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications for bookings</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS notifications for urgent updates</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Push notifications for promotions</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;