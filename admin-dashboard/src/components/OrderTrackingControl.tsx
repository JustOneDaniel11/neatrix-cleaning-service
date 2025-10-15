import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Eye, 
  RefreshCw,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface OrderTrackingControlProps {
  bookings: any[];
  supabase: any;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onRefreshBookings: () => Promise<void>;
}

const OrderTrackingControl: React.FC<OrderTrackingControlProps> = ({
  bookings,
  supabase,
  formatCurrency,
  formatDate,
  onRefreshBookings
}) => {
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState({ type: '', text: '' });
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Get dry cleaning orders from bookings
  const dryCleaningOrders = bookings?.filter(booking => 
    booking.service_type === 'dry_cleaning' || booking.service_name?.toLowerCase().includes('dry')
  ) || [];

  const updateTrackingStage = async (bookingId: string, newStage: string, notes = '') => {
    setTrackingLoading(true);
    try {
      // Get current booking data
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('stage_timestamps, tracking_history, total_amount')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Prepare updated timestamps
      const currentTimestamps = currentBooking?.stage_timestamps || {};
      const updatedTimestamps = {
        ...currentTimestamps,
        [newStage]: new Date().toISOString()
      };

      // Prepare updated history
      const currentHistory = currentBooking?.tracking_history || [];
      const newHistoryEntry = {
        stage: newStage,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
      const updatedHistory = [...currentHistory, newHistoryEntry];

      // Update the booking
      const { data, error } = await supabase
        .from('bookings')
        .update({
          tracking_stage: newStage,
          stage_timestamps: updatedTimestamps,
          tracking_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      setTrackingMessage({ type: 'success', text: 'Order tracking updated successfully!' });
      
      // Add a small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh bookings data
      await onRefreshBookings();
      
      setTimeout(() => setTrackingMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating tracking stage:', error);
      setTrackingMessage({ type: 'error', text: 'Failed to update tracking stage' });
      setTimeout(() => setTrackingMessage({ type: '', text: '' }), 3000);
    } finally {
      setTrackingLoading(false);
    }
  };

  const updateTotalAmount = async (bookingId: string, newAmount: number) => {
    setTrackingLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          total_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      setTrackingMessage({ type: 'success', text: 'Total amount updated successfully!' });
      
      // Add a small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh bookings data
      await onRefreshBookings();
      
      // Reset editing state
      setEditingPrice(null);
      setTempPrice('');
      
      setTimeout(() => setTrackingMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating total amount:', error);
      setTrackingMessage({ type: 'error', text: 'Failed to update total amount' });
      setTimeout(() => setTrackingMessage({ type: '', text: '' }), 3000);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handlePriceEdit = (orderId: string, currentAmount: number) => {
    setEditingPrice(orderId);
    setTempPrice(currentAmount.toString());
  };

  const handlePriceSave = async (orderId: string) => {
    const newAmount = parseFloat(tempPrice);
    if (isNaN(newAmount) || newAmount < 0) {
      setTrackingMessage({ type: 'error', text: 'Please enter a valid amount' });
      setTimeout(() => setTrackingMessage({ type: '', text: '' }), 3000);
      return;
    }
    await updateTotalAmount(orderId, newAmount);
  };

  const handlePriceCancel = () => {
    setEditingPrice(null);
    setTempPrice('');
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'order_received': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'picked_up': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'in_cleaning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'quality_check': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'out_for_delivery': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getNextStage = (currentStage: string) => {
    const stages = ['order_received', 'picked_up', 'in_cleaning', 'quality_check', 'out_for_delivery', 'delivered'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const getStageProgress = (stage: string) => {
    const stages = ['order_received', 'picked_up', 'in_cleaning', 'quality_check', 'out_for_delivery', 'delivered'];
    return ((stages.indexOf(stage) + 1) / stages.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Tracking Control</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and update order tracking stages in real-time</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span>{dryCleaningOrders.length} Active Orders</span>
          </div>
        </div>
      </div>

      {/* Tracking Message */}
      {trackingMessage.text && (
        <div className={`p-4 rounded-lg border ${
          trackingMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center">
            {trackingMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{trackingMessage.text}</span>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dryCleaningOrders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Orders</h3>
            <p className="text-gray-600 dark:text-gray-400">No dry cleaning orders to track at the moment.</p>
          </div>
        ) : (
          dryCleaningOrders.map((order) => {
            const currentStage = order.tracking_stage || 'order_received';
            const nextStage = getNextStage(currentStage);
            
            return (
              <div 
                key={order.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                onKeyDown={(e) => {
                  // Only allow specific keys for the price input
                  if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
                    return; // Allow normal input behavior
                  }
                  // For all other elements, prevent Enter from bubbling
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
                onKeyPress={(e) => {
                  // Only allow specific keys for the price input
                  if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
                    return; // Allow normal input behavior
                  }
                  // For all other elements, prevent Enter from bubbling
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.user_name || 'Customer'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(currentStage)}`}>
                    {currentStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Service Date:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(order.service_date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Items:</span>
                    <span className="text-gray-900 dark:text-white">{order.item_count || 1} items</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    {editingPrice === order.id ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePriceSave(order.id);
                          return false;
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePriceSave(order.id);
                              return false;
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePriceCancel();
                              return false;
                            }
                          }}
                          onKeyPress={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }
                          }}
                          onKeyUp={(e) => {
                            e.stopPropagation();
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          step="0.01"
                          min="0"
                          autoFocus
                        />
                        <button
                          type="submit"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePriceSave(order.id);
                            return false;
                          }}
                          disabled={trackingLoading}
                          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePriceCancel();
                            return false;
                          }}
                          disabled={trackingLoading}
                          className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(order.total_amount)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePriceEdit(order.id, order.total_amount);
                          }}
                          disabled={trackingLoading}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                          title="Edit total amount"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(getStageProgress(currentStage))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStageProgress(currentStage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div 
                  className="flex space-x-2"
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyPress={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyUp={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {nextStage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateTrackingStage(order.id, nextStage);
                        return false;
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          updateTrackingStage(order.id, nextStage);
                          return false;
                        }
                      }}
                      disabled={trackingLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      {trackingLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Next Stage
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOrderDetails(order.id);
                      return false;
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      expandedOrder === order.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''
                    }`}
                    title={expandedOrder === order.id ? 'Hide details' : 'View details'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Order Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                          <span className="text-gray-900 dark:text-white font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                          <span className="text-gray-900 dark:text-white">{order.customer_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                          <span className="text-gray-900 dark:text-white">{order.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="text-gray-900 dark:text-white">{order.email || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Address:</span>
                          <span className="text-gray-900 dark:text-white text-right">{order.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Pickup Option:</span>
                          <span className="text-gray-900 dark:text-white">{order.pickup_option || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Created:</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(order.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {order.item_details && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Item Details</h5>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {typeof order.item_details === 'string' ? order.item_details : JSON.stringify(order.item_details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {order.tracking_notes && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tracking Notes</h5>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-300">{order.tracking_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { stage: 'order_received', label: 'Received', color: 'blue' },
          { stage: 'picked_up', label: 'Picked Up', color: 'yellow' },
          { stage: 'in_cleaning', label: 'Cleaning', color: 'purple' },
          { stage: 'quality_check', label: 'Quality Check', color: 'orange' },
          { stage: 'out_for_delivery', label: 'Delivery', color: 'indigo' },
          { stage: 'delivered', label: 'Delivered', color: 'green' }
        ].map(({ stage, label, color }) => {
          const count = dryCleaningOrders.filter(order => (order.tracking_stage || 'order_received') === stage).length;
          return (
            <div key={stage} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 text-center">
              <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingControl;