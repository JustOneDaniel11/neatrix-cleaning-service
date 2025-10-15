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
  customer_name: string;
  customer_email: string;
  service_name: string;
  pickup_option: string;
  tracking_stage: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  stage_timestamps?: { [key: string]: string };
}

interface OrderDetailsProps {
  order: Order | null;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onOrderUpdate?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  formatCurrency,
  formatDate,
  onOrderUpdate,
  onShowToast
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [tempPrice, setTempPrice] = useState('');
  const [tempDeliveryType, setTempDeliveryType] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
        updates.total_amount = parseFloat(tempPrice);
      }

      if (isEditingDelivery && tempDeliveryType !== order.pickup_option) {
        updates.pickup_option = tempDeliveryType;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', order.id);

        if (error) throw error;

        onShowToast?.('Order details updated successfully', 'success');
        onOrderUpdate?.();
      }

      setIsEditingPrice(false);
      setIsEditingDelivery(false);
    } catch (error) {
      console.error('Error updating order:', error);
      onShowToast?.('Failed to update order details', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTrackingStage = async (newStage: string) => {
    console.log('🔥 Button clicked! updateTrackingStage called with:', newStage);
    console.log('🔥 Order object:', order);
    
    if (!order || !newStage) {
      console.log('🔥 Early return - order or newStage missing:', { order: !!order, newStage });
      return;
    }

    try {
      setIsUpdating(true);
      
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
        updatedTimestamps
      });

      const updateData: any = {
        tracking_stage: newStage,
        stage_timestamps: updatedTimestamps,
        updated_at: now
      };

      // Ensure pickup_option is set if missing
      if (!order.pickup_option) {
        updateData.pickup_option = 'pickup';
        console.log('📝 Also setting pickup_option to: pickup');
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', order.id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful, data:', data);

      onShowToast?.(`🚀 Order moved to: ${getStageLabel(newStage)}`, 'success');
      onOrderUpdate?.();
    } catch (error) {
      console.error('Error updating tracking stage:', error);
      onShowToast?.('❌ Failed to update order stage', 'error');
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
                <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900">
                  {order.customer_name}
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Email</label>
                <div className="px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900">
                  {order.customer_email}
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

          {/* Advanced Progress Tracker */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100 mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                Order Progress
              </h4>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">
                {Math.round(((currentStageIndex + 1) / stages.length) * 100)}% Complete
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="relative mb-8">
              {/* Background Line */}
              <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-200 rounded-full"></div>
              
              {/* Progress Line */}
              <div 
                className="absolute top-8 h-0.5 bg-gradient-to-r from-green-400 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  left: '1.5rem',
                  width: `calc(${Math.max(0, ((currentStageIndex + 1) / stages.length) * 100)}% - 3rem)`,
                  maxWidth: 'calc(100% - 3rem)'
                }}
              ></div>

              {/* Stage Nodes */}
              <div className="flex justify-between items-center relative">
                {stages.map((stage, index) => {
                  const isCompleted = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  return (
                    <div key={stage} className="flex flex-col items-center group relative">
                      {/* Stage Node */}
                      <div className={`
                        relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 cursor-pointer
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                          : isCurrent 
                            ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/50 animate-pulse' 
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7" />
                        ) : isCurrent ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-ping"></div>
                        ) : (
                          <div className="w-4 h-4 sm:w-6 sm:h-6">
                            {getStageIcon(stage)}
                          </div>
                        )}
                        
                        {/* Glow effect for current stage */}
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping"></div>
                        )}
                      </div>

                      {/* Stage Label */}
                      <div className="mt-3 sm:mt-4 text-center max-w-20 sm:max-w-24">
                        <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 leading-tight ${
                          isCompleted 
                            ? 'text-green-700' 
                            : isCurrent 
                              ? 'text-purple-700' 
                              : 'text-gray-500'
                        }`}>
                          {getStageLabel(stage)}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-purple-600 mt-1">Current</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
