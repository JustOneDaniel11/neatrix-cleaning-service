import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  MessageSquare,
  AlertCircle,
  Loader2,
  Droplets,
  Shirt,
  Gift,
  Home
} from 'lucide-react';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../contexts/SupabaseDataContext';

interface TrackingStage {
  stage_name: string;
  stage_label: string;
  completed: boolean;
  timestamp: string | null;
  notes: string;
}

interface OrderTrackerProps {
  booking: Booking;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ booking }) => {
  const [trackingStages, setTrackingStages] = useState<TrackingStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch tracking progress for this booking
  const fetchTrackingProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get fresh booking data from database
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select('tracking_stage, stage_timestamps, tracking_history, pickup_option')
        .eq('id', booking.id)
        .single();
      
      if (error) {
        console.error('Error fetching booking data:', error);
        setError('Failed to load tracking information');
        return;
      }
      
      // Create tracking stages from booking data
      if (bookingData) {
        const stages = createTrackingStagesFromData(bookingData);
        setTrackingStages(stages);
      } else {
        const fallbackStages = createFallbackTrackingStages();
        setTrackingStages(fallbackStages);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  // Create tracking stages array from booking data
  const createTrackingStagesFromData = (data: any): TrackingStage[] => {
    const currentStage = data.tracking_stage || 'sorting';
    const pickupOption = data.pickup_option || 'pickup';
    const stageTimestamps = data.stage_timestamps || {};
    const stageNotes = data.stage_notes || {};
    
    // Define the standard stages
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
    
    // Find current stage index
    const currentStageIndex = allStages.findIndex(stage => stage.name === currentStage);
    
    // Create tracking stages array
    return allStages.map((stage, index) => ({
      stage_name: stage.name,
      stage_label: stage.label,
      completed: index <= currentStageIndex,
      timestamp: stageTimestamps[stage.name] || null,
      notes: stageNotes[stage.name] || ''
    }));
  };

  // Create fallback tracking stages when database function is not available
  const createFallbackTrackingStages = (): TrackingStage[] => {
    const standardStages = [
      { name: 'sorting', label: 'Sorting' },
      { name: 'stain_removing', label: 'Stain Removing' },
      { name: 'washing', label: 'Washing' },
      { name: 'ironing', label: 'Ironing' },
      { name: 'packing', label: 'Packing' },
      { name: 'ready_for_delivery', label: 'Ready for Delivery' },
      { name: 'out_for_delivery', label: 'Out for Delivery' },
      { name: 'delivered', label: 'Delivered' }
    ];
    
    // For fallback, show first stage as current and rest as pending
    return standardStages.map((stage, index) => ({
      stage_name: stage.name,
      stage_label: stage.label,
      completed: index === 0, // Only first stage completed
      timestamp: index === 0 ? booking.created_at : null,
      notes: index === 0 ? 'Order received and processing started' : ''
    }));
  };

  useEffect(() => {
    fetchTrackingProgress();
  }, [booking.id]);

  // Set up real-time subscription for this booking
  useEffect(() => {
    const channel = supabase
      .channel(`booking-${booking.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`
        },
        () => {
          // Refetch tracking progress when booking is updated
          fetchTrackingProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.id]);

  const getStageIcon = (stage: TrackingStage, index: number) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'sorting': <Package className="w-4 h-4" />,
      'stain_removing': <Droplets className="w-4 h-4" />,
      'washing': <Loader2 className="w-4 h-4" />,
      'ironing': <Shirt className="w-4 h-4" />,
      'packing': <Gift className="w-4 h-4" />,
      'ready_for_delivery': <Truck className="w-4 h-4" />,
      'ready_for_pickup': <MapPin className="w-4 h-4" />,
      'out_for_delivery': <Truck className="w-4 h-4" />,
      'picked_up': <CheckCircle className="w-4 h-4" />,
      'delivered': <Home className="w-4 h-4" />
    };

    return iconMap[stage.stage_name] || <Clock className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getProgressPercentage = () => {
    const completedStages = trackingStages.filter(stage => stage.completed).length;
    return Math.round((completedStages / trackingStages.length) * 100);
  };

  const getCurrentStageInfo = () => {
    const currentStageIndex = trackingStages.findIndex(s => !s.completed);
    if (currentStageIndex === -1) {
      return { label: 'Order Complete', description: 'Your order has been completed successfully!' };
    }
    
    const currentStage = trackingStages[currentStageIndex];
    const descriptions: { [key: string]: string } = {
      'sorting': 'Your items are being sorted and cataloged',
      'stain_removing': 'Stains are being treated with specialized solutions',
      'washing': 'Your items are being carefully cleaned',
      'ironing': 'Your items are being pressed and finished',
      'packing': 'Your items are being packaged for delivery/pickup',
      'ready_for_delivery': 'Your order is ready and will be delivered soon',
      'ready_for_pickup': 'Your order is ready for pickup at our location',
      'out_for_delivery': 'Your order is on its way to you',
      'picked_up': 'Order has been picked up',
      'delivered': 'Order has been delivered'
    };
    
    return {
      label: currentStage.stage_label,
      description: descriptions[currentStage.stage_name] || 'Processing your order'
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading tracking information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 border border-red-200">
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const currentStage = getCurrentStageInfo();
  const progressPercentage = getProgressPercentage();
  const currentStageIndex = trackingStages.findIndex(s => !s.completed);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{booking.id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-sm text-gray-600">
              {booking.service_name} • {new Date(booking.service_date).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              progressPercentage === 100 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {progressPercentage === 100 ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Current Stage Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-100 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {progressPercentage === 100 ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentStage.label}</p>
              <p className="text-sm text-gray-600">{currentStage.description}</p>
            </div>
          </div>
        </div>

        {/* Mobile-First Progress Tracker */}
        <div className="w-full max-w-full overflow-hidden">
          {/* Mobile: Vertical Progress Tracker */}
          <div className="block sm:hidden">
            <div className="space-y-3">
              {trackingStages.map((stage, index) => {
                const isCompleted = stage.completed;
                const isCurrent = index === currentStageIndex;
                const timestamp = formatTimestamp(stage.timestamp);

                return (
                  <div key={stage.stage_name} className="flex items-center space-x-3 w-full">
                    {/* Stage Node */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-purple-500 border-purple-500 text-white animate-pulse' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      ) : (
                        <div className="w-4 h-4">
                          {getStageIcon(stage, index)}
                        </div>
                      )}
                    </div>

                    {/* Stage Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${
                          isCompleted 
                            ? 'text-green-700' 
                            : isCurrent 
                              ? 'text-purple-700' 
                              : 'text-gray-500'
                        }`}>
                          {stage.stage_label}
                        </p>
                        {timestamp && (isCompleted || isCurrent) && (
                          <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {timestamp.time}
                          </p>
                        )}
                      </div>
                      {stage.notes && (isCompleted || isCurrent) && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{stage.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop: Horizontal Progress Tracker */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Progress Line Background */}
              <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-200 rounded-full"></div>
              
              {/* Animated Progress Line */}
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
                  const timestamp = formatTimestamp(stage.timestamp);

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
                            {getStageIcon(stage, index)}
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
                            {timestamp.time}
                          </p>
                        )}
                      </div>

                      {/* Tooltip */}
                      {timestamp && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          <div className="text-center">
                            <div className="font-medium">{stage.stage_label}</div>
                            <div className="text-gray-300">{timestamp.date}</div>
                            <div className="text-gray-300">{timestamp.time}</div>
                            {stage.notes && (
                              <div className="text-gray-300 text-xs mt-1 max-w-32 break-words">{stage.notes}</div>
                            )}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Order Details</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Items: {booking.item_count || 1} pieces</p>
              <p>Service: {booking.service_name}</p>
              <p>Total: ${booking.total_amount}</p>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Delivery Info</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                {(booking as any).pickup_option === 'delivery' ? (
                  <Truck className="w-4 h-4 mr-1" />
                ) : (
                  <MapPin className="w-4 h-4 mr-1" />
                )}
                <span>
                  {(booking as any).pickup_option === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                </span>
              </div>
              <p>Address: {booking.address}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
          <button 
             onClick={() => window.open('tel:+2349034842430', '_self')}
             className="flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors min-h-[44px] touch-manipulation"
           >
            <Phone className="w-5 h-5 mr-2" />
            Call Support
          </button>
          <button 
            onClick={() => navigate('/support')}
            className="flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors min-h-[44px] touch-manipulation"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;