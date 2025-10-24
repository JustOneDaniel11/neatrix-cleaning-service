import React, { useState } from 'react';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';
import {
  Shirt,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Truck,
  Home,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Check,
  ArrowRight
} from 'lucide-react';

interface LaundryOrder {
  id: string;
  user_id: string;
  booking_id?: string;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  service_name?: string;
  service_type?: string;
  item_count?: number;
  amount?: number;
  total_amount?: number;
  status: string;
  created_at: string;
  updated_at?: string;
  date?: string;
  time?: string;
  address?: string;
  pickup_address?: string;
  delivery_address?: string;
  pickup_date?: string;
  pickup_time?: string;
  delivery_date?: string;
  delivery_time?: string;
  special_instructions?: string;
  pickup_status?: string;
  cleaning_status?: string;
  delivery_status?: string;
  tracking_stage?: string;
  pickup_option?: string;
  stage_timestamps?: any;
  stage_notes?: any;
  tracking_history?: any;
}

export default function LaundryPage() {
  const { state, fetchLaundryOrders } = useSupabaseData();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'picked':
      case 'picked_up':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'in_progress':
      case 'cleaning':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ready':
      case 'ready_for_delivery':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'picked':
      case 'picked_up':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
      case 'completed':
        return <Home className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const updateOrderStatus = async (orderId: string, action: string) => {
    setIsUpdating(true);
    try {
      const order = state.laundryOrders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const now = new Date().toISOString();
      const updateData: any = { 
        updated_at: now
      };

      // Handle different actions with correct status values
      if (action === 'approve') {
        // Approve order - set to confirmed but don't start tracking yet
        updateData.status = 'confirmed';
        // Don't set tracking_stage yet - wait for pickup/dropoff confirmation
      } else if (action === 'picked_up') {
        // Customer brought laundry to us (pickup service) - now start sorting
        updateData.status = 'in_progress';
        updateData.tracking_stage = 'sorting';
        updateData.stage_timestamps = {
          ...order.stage_timestamps,
          picked_up: now,
          sorting: now
        };
      } else if (action === 'dropped_off') {
        // Customer dropped off laundry (dropoff service) - now start sorting
        updateData.status = 'in_progress';
        updateData.tracking_stage = 'sorting';
        updateData.stage_timestamps = {
          ...order.stage_timestamps,
          dropped_off: now,
          sorting: now
        };
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for user
      if (order?.user_id) {
        const notificationMessages = {
          approve: 'Your laundry order has been approved. Please bring your items to us or we will pick them up.',
          picked_up: 'We have received your laundry items and processing has started.',
          dropped_off: 'We have received your laundry items and processing has started.'
        };

        const message = notificationMessages[action as keyof typeof notificationMessages];
        if (message) {
          await supabase
            .from('notifications')
            .insert({
              user_id: order.user_id,
              title: `Laundry Order Update`,
              message,
              type: 'laundry',
              status: 'unread',
              priority: 'normal',
              action_url: '/dashboard/laundry'
            });
        }
      }

      await fetchLaundryOrders();
      toast({
        title: "Order Updated",
        description: `Order ${action.replace('_', ' ')} successfully`,
      });

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: updateData.status, tracking_stage: updateData.tracking_stage });
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openOrderDetails = (order: LaundryOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const getOrderStats = () => {
    const total = state.laundryOrders.length;
    const pending = state.laundryOrders.filter(o => o.status === 'pending').length;
    const approved = state.laundryOrders.filter(o => o.status === 'confirmed').length;
    const inProgress = state.laundryOrders.filter(o => ['picked', 'picked_up', 'in_progress', 'cleaning'].includes(o.status)).length;
    const completed = state.laundryOrders.filter(o => ['delivered', 'completed'].includes(o.status)).length;

    return { total, pending, approved, inProgress, completed };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Laundry Orders</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage laundry and dry cleaning orders</p>
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
                  toast({
                    title: "Refreshed",
                    description: "Laundry orders updated successfully",
                  });
                } catch (error) {
                  toast({
                    title: "Refresh Failed",
                    description: "Failed to refresh laundry orders",
                    variant: "destructive",
                  });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 w-full max-w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <Shirt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
              <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">In Progress</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
              <Home className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
        {state.laundryOrders.length === 0 ? (
          <div className="text-center py-12">
            <Shirt className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No laundry orders found</h3>
            <p className="text-gray-500 dark:text-gray-400">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {state.laundryOrders.map((order, index) => (
              <div
                key={`${order.id}-${index}`}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => openOrderDetails(order)}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {order.order_number || `#${order.id.slice(-6)}`}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {order.customer_name || 'Unknown Customer'}
                    </span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">{order.customer_phone}</span>
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {order.service_type || 'Laundry Service'} • {order.item_count || 0} items
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(order.total_amount || order.amount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {order.pickup_option === 'pickup' ? (
                      <Truck className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Home className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      {order.pickup_option === 'pickup' ? 'Pickup' : 'Drop-off'} Service
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openOrderDetails(order);
                    }}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'approve');
                      }}
                      disabled={isUpdating}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  
                  {order.status === 'confirmed' && !order.tracking_stage && (
                    <>
                      {order.pickup_option === 'pickup' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'picked_up');
                          }}
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Picked Up
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'dropped_off');
                          }}
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Home className="w-4 h-4" />
                          Dropped Off
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Details - {selectedOrder.order_number || `#${selectedOrder.id.slice(-6)}`}
              </h3>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Status</h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Date</h4>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedOrder.customer_name || 'Unknown Customer'}
                      </span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Service Details</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Shirt className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {selectedOrder.service_type || 'Laundry Service'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {selectedOrder.item_count || 0} items
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(selectedOrder.total_amount || selectedOrder.amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                {(selectedOrder.pickup_address || selectedOrder.delivery_address) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Address Information</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      {selectedOrder.pickup_address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Pickup Address</p>
                            <p className="text-gray-600 dark:text-gray-300">{selectedOrder.pickup_address}</p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.delivery_address && (
                        <div className="flex items-start gap-3">
                          <Home className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Delivery Address</p>
                            <p className="text-gray-600 dark:text-gray-300">{selectedOrder.delivery_address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {selectedOrder.special_instructions && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Special Instructions</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white">{selectedOrder.special_instructions}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'approve');
                        closeOrderModal();
                      }}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve Order
                    </button>
                  )}
                  
                  {selectedOrder.status === 'confirmed' && !selectedOrder.tracking_stage && (
                    <>
                      {selectedOrder.pickup_option === 'pickup' ? (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'picked_up');
                            closeOrderModal();
                          }}
                          disabled={isUpdating}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Picked Up
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'dropped_off');
                            closeOrderModal();
                          }}
                          disabled={isUpdating}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                          <Home className="w-4 h-4" />
                          Dropped Off
                        </button>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={closeOrderModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Close
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