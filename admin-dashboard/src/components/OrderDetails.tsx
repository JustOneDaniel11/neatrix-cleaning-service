import React, { useState } from 'react';
import { 
  Package, 
  User, 
  Mail, 
  DollarSign, 
  Edit3, 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  Droplets,
  Shirt,
  Gift,
  Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  service_type?: string;
  pickup_option: string;
  tracking_stage: string;
  total_amount: number;
  amount?: number;
  status?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  stage_timestamps?: { [key: string]: string };
  stages?: string[];
  users?: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
  };
}

interface OrderDetailsProps {
  order: Order | null;
  onOrderUpdate?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onOrderUpdate,
  showToast
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Default formatters if not provided
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const [tempPrice, setTempPrice] = useState('');
  const [tempDeliveryType, setTempDeliveryType] = useState('');

  // Stage definitions - matching the original dry cleaning workflow
  const getTrackingStages = (pickupOption: string) => {
    const standardStages = [
      'sorting',
      'stain_removing', 
      'washing',
      'ironing',
      'packing'
    ];

    if (pickupOption === 'delivery') {
      return [...standardStages, 'ready_for_delivery', 'out_for_delivery', 'delivered'];
    } else {
      return [...standardStages, 'ready_for_pickup', 'picked_up'];
    }
  };

  const getStageLabel = (stage: string): string => {
    const stageLabels: { [key: string]: string } = {
      'sorting': 'Sorting',
      'stain_removing': 'Stain Removing',
      'washing': 'Washing',
      'ironing': 'Ironing',
      'packing': 'Packing',
      'ready_for_pickup': 'Ready for Pickup',
      'picked_up': 'Picked Up',
      'ready_for_delivery': 'Ready for Delivery',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    return stageLabels[stage] || stage;
  };

  // Stage icon mapping
  const getStageIcon = (stageName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'sorting': <Package className="w-4 h-4" />,
      'stain_removing': <Droplets className="w-4 h-4" />,
      'washing': <Droplets className="w-4 h-4" />,
      'ironing': <Shirt className="w-4 h-4" />,
      'packing': <Gift className="w-4 h-4" />,
      'ready_for_pickup': <Clock className="w-4 h-4" />,
      'picked_up': <Truck className="w-4 h-4" />,
      'ready_for_delivery': <Clock className="w-4 h-4" />,
      'out_for_delivery': <Truck className="w-4 h-4" />,
      'delivered': <Home className="w-4 h-4" />
    };
    return iconMap[stageName] || <Clock className="w-4 h-4" />;
  };

  const getNextStage = (currentStage: string, pickupOption: string): string | null => {
    const stages = getTrackingStages(pickupOption);
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const getPreviousStage = (currentStage: string, pickupOption: string): string | null => {
    const stages = getTrackingStages(pickupOption);
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex > 0 ? stages[currentIndex - 1] : null;
  };

  const startPriceEdit = () => {
    setTempPrice(order?.total_amount.toString() || '');
    setIsEditingPrice(true);
  };

  const startDeliveryEdit = () => {
    setTempDeliveryType(order?.pickup_option || '');
    setIsEditingDelivery(true);
  };

  const saveOrderInfo = async () => {
    if (!order) return;

    try {
      setIsUpdating(true);
      const updates: any = {};

      if (isEditingPrice && tempPrice !== order.total_amount.toString()) {
        // Use Math.round to avoid floating-point precision errors
        updates.total_amount = Math.round(parseFloat(tempPrice) * 100) / 100;
      }

      if (isEditingDelivery && tempDeliveryType !== order.pickup_option) {
        updates.pickup_option = tempDeliveryType;
      }

      if (Object.keys(updates).length > 0) {
        // Only update if this is a laundry/dry cleaning order
        const { error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', order.id)
          .in('service_type', ['laundry', 'dry_cleaning']);

        if (error) throw error;

        showToast?.('Order details updated successfully', 'success');
        onOrderUpdate?.();
      }

      setIsEditingPrice(false);
      setIsEditingDelivery(false);
      setTempPrice('');
      setTempDeliveryType('');
    } catch (error) {
      console.error('Error updating order:', error);
      showToast?.('Failed to update order details', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTrackingStage = async (newStage: string) => {
    console.log('🔥 Button clicked! updateTrackingStage called with:', newStage);
    console.log('🔥 Order object:', order);
    
    if (!order || !newStage) {
      console.log('🔥 Early return - order or newStage missing:', { order: !!order, newStage });
      showToast?.('❌ Missing order or stage information', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Check if supabase client is available
      if (!supabase) {
        console.error('❌ Supabase client not available');
        showToast?.('❌ Database connection not available', 'error');
        return;
      }
      
      const now = new Date().toISOString();
      const currentTimestamps = order.stage_timestamps || {};
      const updatedTimestamps = {
        ...currentTimestamps,
        [newStage]: now
      };

      console.log('📝 Updating order stage:', {
        orderId: order.id.slice(-6),
        currentStage: order.tracking_stage,
        newStage,
        pickupOption: order.pickup_option,
        updatedTimestamps,
        orderIdType: typeof order.id,
        orderIdLength: order.id?.length
      });

      // Full update with stage_timestamps
      const updateData: any = {
        tracking_stage: newStage,
        updated_at: now,
        stage_timestamps: updatedTimestamps
      };

      // Ensure pickup_option is set if missing
      if (!order.pickup_option) {
        updateData.pickup_option = 'pickup';
        console.log('📝 Also setting pickup_option to: pickup');
      }

      console.log('📝 Final update data:', updateData);
      console.log('📝 Updating record with ID:', order.id);

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', order.id)
        .select();

      if (error) {
        console.error('❌ Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        showToast?.(`❌ Database error: ${error.message}`, 'error');
        throw error;
      }

      // Note: Due to RLS policies, update may return empty array even when successful
      // We'll verify the update by checking if no error occurred
      if (!data || data.length === 0) {
        console.log('ℹ️ Update returned no data (likely due to RLS policy), verifying...');
        
        // Verify the update was successful by fetching the record
        const { data: verifyData, error: verifyError } = await supabase
          .from('bookings')
          .select('id, tracking_stage, updated_at')
          .eq('id', order.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Failed to verify update:', verifyError);
          showToast?.('⚠️ Order not found or not updated', 'error');
          return;
        }
        
        if (verifyData.tracking_stage === newStage) {
          console.log('✅ Update verified successful via re-fetch');
        } else {
          console.warn('⚠️ Update verification failed - stage not updated');
          showToast?.('⚠️ Order not found or not updated', 'error');
          return;
        }
      } else {
        console.log('✅ Update successful, data:', data);
      }

      showToast?.(`🚀 Order moved to: ${getStageLabel(newStage)}`, 'success');
      onOrderUpdate?.();
    } catch (error) {
      console.error('❌ Error updating tracking stage:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          showToast?.('❌ Network error - check your connection', 'error');
        } else if (error.message.includes('permission')) {
          showToast?.('❌ Permission denied - contact administrator', 'error');
        } else {
          showToast?.(`❌ Update failed: ${error.message}`, 'error');
        }
      } else {
        showToast?.('❌ Failed to update order stage', 'error');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-xl font-medium text-gray-900 mb-2">Select an Order</h3>
          <p className="text-sm sm:text-base text-gray-600">Choose an order from the inbox to view and update its tracking progress.</p>
        </div>
      </div>
    );
  }

  const stages = getTrackingStages(order.pickup_option);
  const currentStageIndex = stages.indexOf(order.tracking_stage);
  const nextStage = getNextStage(order.tracking_stage, order.pickup_option);
  const previousStage = getPreviousStage(order.tracking_stage, order.pickup_option);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
              <p className="text-sm text-gray-600">#{order.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          
          {(isEditingPrice || isEditingDelivery) && (
            <div className="flex space-x-2">
              <button
                onClick={saveOrderInfo}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditingPrice(false);
                  setIsEditingDelivery(false);
                  setTempPrice('');
                  setTempDeliveryType('');
                }}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Customer Information
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Customer Name</label>
                <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 break-words">
                  {order.customer_name || 'Unknown User'}
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Email</label>
                <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 break-words flex items-center">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500" />
                  {order.customer_email || 'Unknown Email'}
                </div>
              </div>

              {(order.users?.phone || order.phone) && (
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1">Phone Number</label>
                  <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 break-words flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {order.users?.phone || order.phone}
                  </div>
                </div>
              )}

              {order.address && (
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1">Address</label>
                  <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 break-words flex items-start">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                    <span>{order.address}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Order Date</label>
                <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 break-words flex items-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500" />
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Package className="w-4 h-4 mr-2" />
              Order Details
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Service Type</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                  {order.service_name}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Delivery Method</label>
                <div className="flex items-center">
                  {isEditingDelivery ? (
                    <select
                      value={tempDeliveryType}
                      onChange={(e) => setTempDeliveryType(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  ) : (
                    <>
                      <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 flex items-center">
                        {order.pickup_option === 'delivery' ? (
                          <><Truck className="w-4 h-4 mr-2" />Delivery</>
                        ) : (
                          <><MapPin className="w-4 h-4 mr-2" />Pickup</>
                        )}
                      </div>
                      <button
                        onClick={startDeliveryEdit}
                        className="ml-2 p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Price</label>
                <div className="flex items-center">
                  {isEditingPrice ? (
                    <input
                      type="number"
                      step="0.01"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <>
                      <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <button
                        onClick={startPriceEdit}
                        className="ml-2 p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Progress Tracker - Mobile Optimized */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-6 border border-purple-100 mt-4 sm:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                Order Progress
              </h4>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">
                {Math.round(((currentStageIndex + 1) / stages.length) * 100)}% Complete
              </div>
            </div>

            {/* Mobile-First Progress Bar - Fixed Layout */}
            <div className="mb-6 sm:mb-8 lg:mb-10">
              {/* Progress Percentage Bar */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 lg:h-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-purple-500 h-2 sm:h-3 lg:h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs sm:text-sm lg:text-base text-gray-500 mt-2 lg:mt-3">
                  <span>Started</span>
                  <span className="font-medium text-purple-600">
                    {Math.round(((currentStageIndex + 1) / stages.length) * 100)}%
                  </span>
                  <span>Complete</span>
                </div>
              </div>

              {/* Stage Timeline - Tablet Optimized */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {stages.map((stage, index) => {
                  const isCompleted = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isUpcoming = index > currentStageIndex;

                  return (
                    <div key={stage} className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                      {/* Stage Node - Tablet Enhanced */}
                      <div className={`
                        relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full border-2 lg:border-3 flex items-center justify-center transition-all duration-300 flex-shrink-0
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white shadow-lg lg:shadow-xl' 
                          : isCurrent 
                            ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/50 lg:shadow-xl lg:shadow-purple-500/60' 
                            : 'bg-gray-100 border-gray-300 text-gray-400 lg:bg-gray-50'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-white rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
                            {getStageIcon(stage)}
                          </div>
                        )}
                        
                        {/* Current stage indicator - Enhanced for tablet */}
                        {isCurrent && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-yellow-400 rounded-full animate-ping"></div>
                        )}
                      </div>

                      {/* Stage Content - Tablet Enhanced */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm sm:text-base lg:text-lg transition-colors duration-300 ${
                          isCompleted 
                            ? 'text-green-700' 
                            : isCurrent 
                              ? 'text-purple-700' 
                              : 'text-gray-500'
                        }`}>
                          {/* Responsive labels for different screen sizes */}
                          <span className="block sm:hidden">
                            {stage === 'order_placed' ? 'Order Placed' :
                             stage === 'confirmed' ? 'Confirmed' :
                             stage === 'in_progress' ? 'In Progress' :
                             stage === 'ready_for_pickup' ? 'Ready for Pickup' :
                             stage === 'out_for_delivery' ? 'Out for Delivery' :
                             stage === 'delivered' ? 'Delivered' :
                             getStageLabel(stage)}
                          </span>
                          <span className="hidden sm:block lg:hidden">
                            {getStageLabel(stage)}
                          </span>
                          {/* Enhanced labels for tablets */}
                          <span className="hidden lg:block">
                            {stage === 'order_placed' ? '📋 Order Successfully Placed' :
                             stage === 'confirmed' ? '✅ Order Confirmed & Scheduled' :
                             stage === 'in_progress' ? '🔄 Service Currently in Progress' :
                             stage === 'ready_for_pickup' ? '📦 Ready for Customer Pickup' :
                             stage === 'out_for_delivery' ? '🚚 Out for Delivery to Customer' :
                             stage === 'delivered' ? '🎉 Successfully Delivered' :
                             getStageLabel(stage)}
                          </span>
                        </div>
                        <div className={`text-xs sm:text-sm lg:text-base mt-1 lg:mt-2 ${
                          isCompleted 
                            ? 'text-green-600' 
                            : isCurrent 
                              ? 'text-purple-600' 
                              : 'text-gray-400'
                        }`}>
                          {/* Enhanced status messages for tablets */}
                          <span className="lg:hidden">
                            {isCurrent && '🔄 Currently in progress'}
                            {isCompleted && '✅ Completed'}
                            {isUpcoming && '⏳ Pending'}
                          </span>
                          <span className="hidden lg:block">
                            {isCurrent && '🔄 This stage is currently being processed'}
                            {isCompleted && '✅ This stage has been completed successfully'}
                            {isUpcoming && '⏳ This stage is pending and will begin soon'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge - Tablet Enhanced */}
                      <div className="flex-shrink-0">
                        {isCurrent && (
                          <div className="bg-purple-100 text-purple-700 text-xs lg:text-sm font-medium px-2 py-1 lg:px-4 lg:py-2 rounded-full lg:rounded-lg">
                            <span className="hidden sm:inline lg:hidden">CURRENT</span>
                            <span className="sm:hidden lg:inline">NOW</span>
                            <span className="hidden lg:inline">ACTIVE</span>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="bg-green-100 text-green-700 text-xs lg:text-sm font-medium px-2 py-1 lg:px-4 lg:py-2 rounded-full lg:rounded-lg">
                            <span className="hidden sm:inline lg:hidden">DONE</span>
                            <span className="sm:hidden lg:inline">✓</span>
                            <span className="hidden lg:inline">COMPLETED</span>
                          </div>
                        )}
                        {isUpcoming && (
                          <div className="bg-gray-100 text-gray-500 text-xs lg:text-sm font-medium px-2 py-1 lg:px-4 lg:py-2 rounded-full lg:rounded-lg">
                            <span className="hidden sm:inline lg:hidden">NEXT</span>
                            <span className="sm:hidden lg:inline">⏳</span>
                            <span className="hidden lg:inline">UPCOMING</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet-specific progress summary */}
              <div className="hidden lg:block mt-8 p-4 bg-gradient-to-r from-purple-50 to-green-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Progress Summary: {currentStageIndex + 1} of {stages.length} stages completed
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentStageIndex < stages.length - 1 ? (
                      <>Next: {getStageLabel(stages[currentStageIndex + 1])}</>
                    ) : (
                      <>🎉 Order Complete!</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="pt-4 border-t border-purple-200">
              {nextStage ? (
                <button
                  onClick={() => {
                    console.log('🔥 Button clicked! nextStage:', nextStage);
                    updateTrackingStage(nextStage);
                  }}
                  disabled={isUpdating}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isUpdating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Stage...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Move to Next Stage
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full flex items-center justify-center px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">Order Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Timestamps */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Created:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Last Updated:</span>
              <span>{formatDate(order.updated_at || order.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
