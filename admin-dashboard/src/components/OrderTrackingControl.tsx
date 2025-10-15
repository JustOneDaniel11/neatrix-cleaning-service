import React, { useState, useCallback, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin, 
  Edit3,
  Save,
  X,
  DollarSign,
  ArrowRight,
  Loader2,
  Droplets,
  Shirt,
  Gift,
  Home,
  User,
  Mail,
  Calendar,
  CreditCard,
  ChevronDown
} from 'lucide-react';

interface OrderTrackingControlProps {
  bookings: any[];
  supabase: any;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onRefreshBookings: () => Promise<void>;
}

interface OrderState {
  editingPrice: boolean;
  tempPrice: number;
  savingOrderInfo: boolean;
  updatingStage: boolean;
  editingDeliveryType: boolean;
  tempDeliveryType: string;
}

interface TrackingStage {
  stage_name: string;
  stage_label: string;
  completed: boolean;
  timestamp: string | null;
  notes: string;
}

interface ToastMessage {
  type: 'success' | 'error';
  text: string;
  id: string;
}

const OrderTrackingControl: React.FC<OrderTrackingControlProps> = ({
  bookings,
  supabase,
  formatCurrency,
  formatDate,
  onRefreshBookings
}) => {
  const [orderStates, setOrderStates] = useState<Record<string, OrderState>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filter for dry cleaning orders
  const dryCleaningOrders = bookings?.filter(booking => 
    booking.service_type === 'dry_cleaning' || booking.service_name?.toLowerCase().includes('dry')
  ) || [];

  // Auto-select first order if none selected
  useEffect(() => {
    if (!selectedOrderId && dryCleaningOrders.length > 0) {
      setSelectedOrderId(dryCleaningOrders[0].id);
    }
  }, [selectedOrderId, dryCleaningOrders]);

  // Initialize missing pickup_option fields for existing orders
  useEffect(() => {
    const initializeMissingPickupOptions = async () => {
      const ordersWithoutPickupOption = dryCleaningOrders.filter(order => !order.pickup_option);
      
      if (ordersWithoutPickupOption.length > 0) {
        console.log('🔧 Initializing pickup_option for', ordersWithoutPickupOption.length, 'orders');
        
        for (const order of ordersWithoutPickupOption) {
          try {
            await supabase
              .from('bookings')
              .update({ pickup_option: 'pickup' })
              .eq('id', order.id);
            
            console.log('✅ Initialized pickup_option for order:', order.id.slice(-6));
          } catch (error) {
            console.error('❌ Failed to initialize pickup_option for order:', order.id.slice(-6), error);
          }
        }
        
        // Refresh data after initialization
        await onRefreshBookings();
      }
    };

    if (dryCleaningOrders.length > 0) {
      initializeMissingPickupOptions();
    }
  }, [dryCleaningOrders.length, supabase, onRefreshBookings]);

  // Get order state with defaults
  const getOrderState = useCallback((orderId: string): OrderState => {
    return orderStates[orderId] || {
      editingPrice: false,
      tempPrice: 0,
      savingOrderInfo: false,
      updatingStage: false,
      editingDeliveryType: false,
      tempDeliveryType: ''
    };
  }, [orderStates]);

  // Update order state
  const updateOrderState = useCallback((orderId: string, updates: Partial<OrderState>) => {
    setOrderStates(prev => ({
      ...prev,
      [orderId]: { ...getOrderState(orderId), ...updates }
    }));
  }, [getOrderState]);

  // Toast management
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { type, text, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  // Get selected order
  const selectedOrder = dryCleaningOrders.find(order => order.id === selectedOrderId);

  // Stage management functions
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

  const createTrackingStages = (order: any): TrackingStage[] => {
    const currentStage = order.tracking_stage || 'sorting';
    const stageTimestamps = order.stage_timestamps || {};
    const pickupOption = order.pickup_option || 'pickup';
    
    // Define the standard stages that match the database schema
    const standardStages = [
      { name: 'sorting', label: 'Sorting' },
      { name: 'stain_removing', label: 'Stain Removing' },
      { name: 'washing', label: 'Washing' },
      { name: 'ironing', label: 'Ironing' },
      { name: 'packing', label: 'Packing' }
    ];
    
    // Define final stages based on pickup option
    const finalStages = pickupOption === 'pickup' 
      ? [
          { name: 'ready_for_pickup', label: 'Ready for Pickup' },
          { name: 'picked_up', label: 'Picked Up' }
        ]
      : [
          { name: 'ready_for_delivery', label: 'Ready for Delivery' },
          { name: 'out_for_delivery', label: 'Out for Delivery' },
          { name: 'delivered', label: 'Delivered' }
        ];
    
    const allStages = [...standardStages, ...finalStages];
    const currentStageIndex = allStages.findIndex(stage => stage.name === currentStage);
    
    return allStages.map((stage, index) => ({
      stage_name: stage.name,
      stage_label: stage.label,
      completed: index <= currentStageIndex,
      timestamp: stageTimestamps[stage.name] || null,
      notes: ''
    }));
  };

  const getNextStage = (currentStage: string, pickupOption: string = 'pickup') => {
    // Define the standard stages that match the database schema
    const standardStages = ['sorting', 'stain_removing', 'washing', 'ironing', 'packing'];
    
    // Define final stages based on pickup option
    const finalStages = pickupOption === 'delivery' 
      ? ['ready_for_delivery', 'out_for_delivery', 'delivered']
      : ['ready_for_pickup', 'picked_up'];
    
    const allStages = [...standardStages, ...finalStages];
    const currentIndex = allStages.indexOf(currentStage);
    
    console.log('🔍 getNextStage debug:', {
      currentStage,
      pickupOption,
      standardStages,
      finalStages,
      allStages,
      currentIndex,
      nextStage: currentIndex < allStages.length - 1 ? allStages[currentIndex + 1] : null
    });
    
    return currentIndex < allStages.length - 1 ? allStages[currentIndex + 1] : null;
  };

  const getProgressPercentage = (stages: TrackingStage[]) => {
    const completedStages = stages.filter(stage => stage.completed).length;
    return Math.round((completedStages / stages.length) * 100);
  };

  // Order info update functions (LEFT PANEL)
  const startPriceEdit = (orderId: string, currentPrice: number) => {
    updateOrderState(orderId, {
      editingPrice: true,
      tempPrice: currentPrice
    });
  };

  const cancelPriceEdit = (orderId: string) => {
    updateOrderState(orderId, {
      editingPrice: false,
      tempPrice: 0
    });
  };

  const startDeliveryTypeEdit = (orderId: string, currentType: string) => {
    updateOrderState(orderId, {
      editingDeliveryType: true,
      tempDeliveryType: currentType
    });
  };

  const cancelDeliveryTypeEdit = (orderId: string) => {
    updateOrderState(orderId, {
      editingDeliveryType: false,
      tempDeliveryType: ''
    });
  };

  const saveOrderInfo = async (orderId: string) => {
    const state = getOrderState(orderId);
    const order = dryCleaningOrders.find(o => o.id === orderId);
    if (!order) return;

    updateOrderState(orderId, { savingOrderInfo: true });

    try {
      const updates: any = { updated_at: new Date().toISOString() };
      
      if (state.editingPrice) {
        updates.total_amount = state.tempPrice;
      }
      
      if (state.editingDeliveryType) {
        updates.pickup_option = state.tempDeliveryType;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      showToast('success', '✅ Order details updated successfully');
      
      // Reset editing states
      updateOrderState(orderId, {
        editingPrice: false,
        tempPrice: 0,
        editingDeliveryType: false,
        tempDeliveryType: '',
        savingOrderInfo: false
      });

      // Refresh data
      await onRefreshBookings();
    } catch (error) {
      console.error('Error updating order info:', error);
      showToast('error', '❌ Failed to update order details');
      updateOrderState(orderId, { savingOrderInfo: false });
    }
  };

  // Progress tracking functions (RIGHT PANEL)
  const updateTrackingStage = async (orderId: string) => {
    const order = dryCleaningOrders.find(o => o.id === orderId);
    if (!order) {
      console.error('❌ Order not found:', orderId);
      showToast('error', '❌ Order not found');
      return;
    }

    // Ensure pickup_option is set - default to 'pickup' if missing
    let pickupOption = order.pickup_option;
    if (!pickupOption) {
      pickupOption = 'pickup';
      console.warn('⚠️ pickup_option missing, defaulting to "pickup"');
    }

    const currentStage = order.tracking_stage || 'sorting';
    const nextStage = getNextStage(currentStage, pickupOption);
    
    console.log('🔍 Stage progression debug:', {
      orderId: orderId.slice(-6),
      orderData: {
        pickup_option: order.pickup_option,
        tracking_stage: order.tracking_stage,
        service_name: order.service_name,
        customer_name: order.customer_name
      },
      computed: {
        pickupOption,
        currentStage,
        nextStage
      }
    });
    
    if (!nextStage) {
      console.warn('⚠️ No next stage available - order may be completed');
      showToast('error', '❌ Order is already at the final stage');
      return;
    }

    updateOrderState(orderId, { updatingStage: true });

    try {
      const now = new Date().toISOString();
      const currentTimestamps = order.stage_timestamps || {};
      const updatedTimestamps = {
        ...currentTimestamps,
        [nextStage]: now
      };

      console.log('📝 Updating order stage:', {
        orderId: orderId.slice(-6),
        currentStage,
        nextStage,
        pickupOption,
        updatedTimestamps
      });

      // Prepare update object
      const updateData: any = {
        tracking_stage: nextStage,
        stage_timestamps: updatedTimestamps,
        updated_at: now
      };

      // If pickup_option was missing, set it in the database
      if (!order.pickup_option) {
        updateData.pickup_option = pickupOption;
        console.log('📝 Also setting pickup_option to:', pickupOption);
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful, data:', data);

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

      showToast('success', `🚀 Order moved to next stage: ${stageLabels[nextStage]}`);
      
      updateOrderState(orderId, { updatingStage: false });
      
      // Refresh data
      console.log('Refreshing bookings data...');
      await onRefreshBookings();
      console.log('Bookings data refreshed');
    } catch (error) {
      console.error('Error updating tracking stage:', error);
      showToast('error', '❌ Failed to update order stage');
      updateOrderState(orderId, { updatingStage: false });
    }
  };

  if (dryCleaningOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
          <p className="text-gray-600">No dry cleaning orders found to track.</p>
        </div>
      </div>
    );
  }

  if (!selectedOrder) return null;

  const orderState = getOrderState(selectedOrder.id);
  const trackingStages = createTrackingStages(selectedOrder);
  const progressPercentage = getProgressPercentage(trackingStages);
  const currentStageIndex = trackingStages.findIndex(s => !s.completed);
  const nextStage = getNextStage(selectedOrder.tracking_stage || 'order_received');

  return (
    <div className="space-y-6">
      {/* Order Selection Dropdown */}
      {dryCleaningOrders.length > 1 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Order to Track
          </label>
          <select
            value={selectedOrderId || ''}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dryCleaningOrders.map(order => (
              <option key={order.id} value={order.id}>
                #{order.id.slice(-6).toUpperCase()} - {order.customer_name} - {formatCurrency(order.total_amount)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT PANEL - Order Information (40% width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Order Information</h3>
                  <p className="text-sm text-gray-600">#{selectedOrder.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Order Details Form */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Customer Name</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedOrder.customer_name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedOrder.customer_email}
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
                    <label className="block text-sm text-gray-600 mb-1">Tracking ID</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono">
                      #NC-{selectedOrder.id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Service Type</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedOrder.service_name}
                    </div>
                  </div>

                  {/* Editable Delivery Type */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Delivery Type</label>
                    {orderState.editingDeliveryType ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={orderState.tempDeliveryType}
                          onChange={(e) => updateOrderState(selectedOrder.id, { tempDeliveryType: e.target.value })}
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pickup">Pickup</option>
                          <option value="delivery">Delivery</option>
                        </select>
                        <button
                          onClick={() => cancelDeliveryTypeEdit(selectedOrder.id)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900 capitalize">
                          {selectedOrder.pickup_option || 'pickup'}
                        </span>
                        <button
                          onClick={() => startDeliveryTypeEdit(selectedOrder.id, selectedOrder.pickup_option || 'pickup')}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Editable Price */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price</label>
                    {orderState.editingPrice ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={orderState.tempPrice}
                            onChange={(e) => updateOrderState(selectedOrder.id, { tempPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <button
                          onClick={() => cancelPriceEdit(selectedOrder.id)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900 font-medium">
                          {formatCurrency(selectedOrder.total_amount)}
                        </span>
                        <button
                          onClick={() => startPriceEdit(selectedOrder.id, selectedOrder.total_amount)}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Order Date</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {formatDate(selectedOrder.created_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Payment Status</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.payment_status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => saveOrderInfo(selectedOrder.id)}
                  disabled={orderState.savingOrderInfo || (!orderState.editingPrice && !orderState.editingDeliveryType)}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    orderState.savingOrderInfo || (!orderState.editingPrice && !orderState.editingDeliveryType)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {orderState.savingOrderInfo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Progress Timeline (60% width) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order Progress Timeline</h3>
                    <p className="text-sm text-gray-600">{progressPercentage}% Complete</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    progressPercentage === 100 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {progressPercentage === 100 ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-200 rounded-full"></div>
                <div 
                  className="absolute top-8 h-0.5 bg-gradient-to-r from-green-400 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    left: '1.5rem',
                    width: `calc(${Math.max(0, (progressPercentage / 100) * 100)}% - 3rem)`,
                    maxWidth: 'calc(100% - 3rem)'
                  }}
                ></div>

                {/* Stage Nodes */}
                <div className="flex justify-between items-center relative">
                  {trackingStages.map((stage, index) => {
                    const isCompleted = stage.completed;
                    const isCurrent = index === currentStageIndex;
                    const timestamp = stage.timestamp ? new Date(stage.timestamp) : null;

                    return (
                      <div key={stage.stage_name} className="flex flex-col items-center group relative">
                        {/* Stage Node */}
                        <div className={`
                          relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 cursor-pointer
                          ${isCompleted 
                            ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                            : isCurrent 
                              ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/50 animate-pulse' 
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                          }
                        `}>
                          {isCompleted ? (
                            <CheckCircle className="w-7 h-7" />
                          ) : isCurrent ? (
                            <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
                          ) : (
                            <div className="w-6 h-6">
                              {getStageIcon(stage.stage_name)}
                            </div>
                          )}
                          
                          {/* Glow effect for current stage */}
                          {isCurrent && (
                            <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping"></div>
                          )}
                        </div>

                        {/* Stage Label */}
                        <div className="mt-4 text-center max-w-24">
                          <p className={`text-sm font-medium transition-colors duration-300 leading-tight ${
                            isCompleted 
                              ? 'text-green-700' 
                              : isCurrent 
                                ? 'text-purple-700' 
                                : 'text-gray-500'
                          }`}>
                            {stage.stage_label}
                          </p>
                          
                          {/* Timestamp */}
                          {timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>

                        {/* Tooltip */}
                        {timestamp && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                            <div className="text-center">
                              <div className="font-medium">{stage.stage_label}</div>
                              <div className="text-gray-300">{timestamp.toLocaleDateString()}</div>
                              <div className="text-gray-300">{timestamp.toLocaleTimeString()}</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Stage Button */}
              <div className="pt-4 border-t border-gray-200">
                {nextStage ? (
                  <button
                    onClick={() => updateTrackingStage(selectedOrder.id)}
                    disabled={orderState.updatingStage}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      orderState.updatingStage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {orderState.updatingStage ? (
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
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform translate-x-0 ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-red-50 border-red-400 text-red-800'
            }`}
          >
            <p className="text-sm font-medium">{toast.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTrackingControl;