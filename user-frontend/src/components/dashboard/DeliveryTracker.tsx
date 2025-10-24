import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Booking } from '../../contexts/SupabaseDataContext';
import DeliveryReviewPrompt from './DeliveryReviewPrompt';

interface DeliveryStage {
  stage_name: string;
  stage_label: string;
  icon: React.ReactNode;
  completed: boolean;
  timestamp: string | null;
  description: string;
}

interface DeliveryTrackerProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ booking, isOpen, onClose }) => {
  const [deliveryStages, setDeliveryStages] = useState<DeliveryStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<{
    name?: string;
    phone?: string;
    estimatedArrival?: string;
  }>({});
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [previousDeliveryStatus, setPreviousDeliveryStatus] = useState<string | null>(null);

  // Fetch delivery tracking data
  const fetchDeliveryTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get delivery tracking data from pickup_deliveries table
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('pickup_deliveries')
        .select('*')
        .eq('booking_id', booking.id)
        .eq('type', 'delivery')
        .single();

      if (deliveryError && deliveryError.code !== 'PGRST116') {
        console.error('Error fetching delivery data:', deliveryError);
      }

      // Get updated booking data for delivery status
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('delivery_status, stage_timestamps')
        .eq('id', booking.id)
        .single();

      if (bookingError) {
        console.error('Error fetching booking data:', bookingError);
        setError('Failed to load delivery information');
        return;
      }

      // Check if delivery status changed to "delivered" to trigger review prompt
      const currentDeliveryStatus = bookingData?.delivery_status;
      if (previousDeliveryStatus && 
          previousDeliveryStatus !== 'delivered' && 
          currentDeliveryStatus === 'delivered') {
        // Delay showing review prompt to allow user to see the completion
        setTimeout(() => {
          setShowReviewPrompt(true);
        }, 2000);
      }
      setPreviousDeliveryStatus(currentDeliveryStatus);

      // Create delivery stages
      const stages = createDeliveryStages(bookingData, deliveryData);
      setDeliveryStages(stages);

      // Set driver info if available
      if (deliveryData) {
        setDriverInfo({
          name: deliveryData.driver_name,
          phone: deliveryData.driver_phone,
          estimatedArrival: deliveryData.scheduled_time
        });
      }

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load delivery information');
    } finally {
      setLoading(false);
    }
  };

  // Create delivery stages from data
  const createDeliveryStages = (bookingData: any, deliveryData: any): DeliveryStage[] => {
    const deliveryStatus = bookingData?.delivery_status || 'pending';
    const stageTimestamps = bookingData?.stage_timestamps || {};
    const isPickupService = booking.pickup_option === 'pickup';
    
    let deliveryStages: DeliveryStage[] = [];

    if (isPickupService) {
      // For pickup services: Picked Up -> Ready for Pickup -> Completed
      deliveryStages = [
        {
          stage_name: 'picked_up',
          stage_label: 'Picked Up',
          icon: <Package className="w-5 h-5" />,
          completed: deliveryStatus !== 'pending' && deliveryStatus !== null,
          timestamp: stageTimestamps.picked_up || (deliveryStatus !== 'pending' && deliveryStatus !== null ? bookingData?.updated_at || booking.created_at : null),
          description: 'Your items have been picked up from our facility'
        },
        {
          stage_name: 'ready_for_pickup',
          stage_label: 'Ready for Pickup',
          icon: <Clock className="w-5 h-5" />,
          completed: ['ready_for_pickup', 'delivered'].includes(deliveryStatus),
          timestamp: stageTimestamps.ready_for_pickup || (deliveryStatus === 'ready_for_pickup' ? new Date().toISOString() : null),
          description: 'Your order is processed and ready for you to pick up'
        },
        {
          stage_name: 'completed',
          stage_label: 'Completed',
          icon: <CheckCircle className="w-5 h-5" />,
          completed: deliveryStatus === 'delivered',
          timestamp: stageTimestamps.completed || (deliveryStatus === 'delivered' ? deliveryData?.actual_time : null),
          description: 'Your order has been successfully completed'
        }
      ];
    } else {
      // For delivery services: Dropped Off -> Ready for Delivery -> Out for Delivery -> Delivered
      deliveryStages = [
        {
          stage_name: 'dropped_off',
          stage_label: 'Dropped Off',
          icon: <Package className="w-5 h-5" />,
          completed: deliveryStatus !== 'pending' && deliveryStatus !== null,
          timestamp: stageTimestamps.dropped_off || (deliveryStatus !== 'pending' && deliveryStatus !== null ? bookingData?.updated_at || booking.created_at : null),
          description: 'Your items have been dropped off at our facility'
        },
        {
          stage_name: 'ready_for_delivery',
          stage_label: 'Ready for Delivery',
          icon: <Clock className="w-5 h-5" />,
          completed: ['ready_for_delivery', 'out_for_delivery', 'delivered'].includes(deliveryStatus),
          timestamp: stageTimestamps.ready_for_delivery || (deliveryStatus === 'ready_for_delivery' ? new Date().toISOString() : null),
          description: 'Your order is processed and ready for delivery'
        },
        {
          stage_name: 'out_for_delivery',
          stage_label: 'Out for Delivery',
          icon: <Truck className="w-5 h-5" />,
          completed: ['out_for_delivery', 'delivered'].includes(deliveryStatus),
          timestamp: stageTimestamps.out_for_delivery || (deliveryStatus === 'out_for_delivery' ? new Date().toISOString() : null),
          description: 'Your order is on its way to your delivery address'
        },
        {
          stage_name: 'delivered',
          stage_label: 'Delivered',
          icon: <CheckCircle className="w-5 h-5" />,
          completed: deliveryStatus === 'delivered',
          timestamp: stageTimestamps.delivered || (deliveryStatus === 'delivered' ? deliveryData?.actual_time : null),
          description: 'Your order has been successfully delivered'
        }
      ];
    }

    return deliveryStages;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Get current stage info
  const getCurrentStage = () => {
    const currentStageIndex = deliveryStages.findIndex(stage => !stage.completed);
    if (currentStageIndex === -1) {
      return deliveryStages[deliveryStages.length - 1]; // All completed, return last stage
    }
    return deliveryStages[currentStageIndex];
  };

  // Set up real-time subscription for delivery updates
  useEffect(() => {
    if (!isOpen) return;

    fetchDeliveryTracking();

    const channel = supabase
      .channel(`delivery-${booking.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`
        },
        () => {
          fetchDeliveryTracking();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_deliveries',
          filter: `booking_id=eq.${booking.id}`
        },
        () => {
          fetchDeliveryTracking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, booking.id]);

  if (!isOpen) return null;

  const currentStage = getCurrentStage();
  const progressPercentage = Math.round((deliveryStages.filter(stage => stage.completed).length / deliveryStages.length) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{booking.id.slice(-6).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                {booking.service_name} • Delivery to {booking.address}
              </p>
            </div>
            <div className="mt-2 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                progressPercentage === 100 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {progressPercentage === 100 ? 'Delivered' : 'In Transit'}
              </span>
            </div>
          </div>

          {/* Current Status */}
          {currentStage && (
            <div className="bg-white rounded-lg p-4 border border-gray-100 mt-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {progressPercentage === 100 ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{currentStage.stage_label}</p>
                  <p className="text-sm text-gray-600">{currentStage.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading delivery information...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={fetchDeliveryTracking}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Delivery Progress */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h4>
                
                {/* Progress Container */}
                <div className="relative px-4 sm:px-6 md:px-8">
                  {/* Progress Line Background */}
                  <div className="absolute top-7 left-0 right-0 flex items-center">
                    <div className="w-full h-0.5 bg-gray-200 rounded-full mx-8 sm:mx-10 md:mx-12"></div>
                  </div>
                  
                  {/* Progress Line Fill */}
                  <div className="absolute top-7 left-0 right-0 flex items-center">
                    <div 
                      className="h-0.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out ml-8 sm:ml-10 md:ml-12"
                      style={{ 
                        width: `calc(${Math.max(0, ((deliveryStages.filter(stage => stage.completed).length - 1) / Math.max(1, deliveryStages.length - 1)) * 100)}% * (100% - 4rem) / 100)`,
                      }}
                    ></div>
                  </div>

                  {/* Stage Nodes Container */}
                  <div className="relative">
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex justify-between items-start">
                      {deliveryStages.map((stage, index) => {
                        const isCompleted = stage.completed;
                        const isCurrent = !isCompleted && index === deliveryStages.findIndex(s => !s.completed);
                        const timestamp = formatTimestamp(stage.timestamp);

                        return (
                          <div key={stage.stage_name} className="flex flex-col items-center group relative flex-1 max-w-32">
                            {/* Stage Node */}
                            <div className={`
                              relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-10 bg-white
                              ${isCompleted 
                                ? 'border-green-500 bg-green-500 text-white shadow-lg' 
                                : isCurrent 
                                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/50 animate-pulse' 
                                  : 'border-gray-300 bg-gray-100 text-gray-400'
                              }
                            `}>
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : isCurrent ? (
                                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                              ) : (
                                <div className="w-5 h-5">{stage.icon}</div>
                              )}
                              
                              {/* Glow effect for current stage */}
                              {isCurrent && (
                                <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping"></div>
                              )}
                            </div>

                            {/* Stage Label */}
                            <div className="mt-4 text-center px-2">
                              <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 leading-tight ${
                                isCompleted 
                                  ? 'text-green-700' 
                                  : isCurrent 
                                    ? 'text-blue-700' 
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
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                <div className="text-center">
                                  <div className="font-medium">{stage.stage_label}</div>
                                  <div className="text-gray-300">{timestamp.date}</div>
                                  <div className="text-gray-300">{timestamp.time}</div>
                                  <div className="text-gray-300 text-xs mt-1 max-w-32 break-words">{stage.description}</div>
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-4">
                      {deliveryStages.map((stage, index) => {
                        const isCompleted = stage.completed;
                        const isCurrent = !isCompleted && index === deliveryStages.findIndex(s => !s.completed);
                        const timestamp = formatTimestamp(stage.timestamp);

                        return (
                          <div key={stage.stage_name} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                            {/* Stage Node */}
                            <div className={`
                              relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
                              ${isCompleted 
                                ? 'border-green-500 bg-green-500 text-white shadow-lg' 
                                : isCurrent 
                                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/50 animate-pulse' 
                                  : 'border-gray-300 bg-gray-100 text-gray-400'
                              }
                            `}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : isCurrent ? (
                                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                              ) : (
                                <div className="w-4 h-4">{stage.icon}</div>
                              )}
                              
                              {/* Glow effect for current stage */}
                              {isCurrent && (
                                <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping"></div>
                              )}
                            </div>

                            {/* Stage Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium transition-colors duration-300 ${
                                isCompleted 
                                  ? 'text-green-700' 
                                  : isCurrent 
                                    ? 'text-blue-700' 
                                    : 'text-gray-500'
                              }`}>
                                {stage.stage_label}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
                              {timestamp && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {timestamp.date} at {timestamp.time}
                                </p>
                              )}
                            </div>

                            {/* Status Indicator */}
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Complete
                                </span>
                              ) : isCurrent ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Current
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Delivery Information
                  </h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Address:</span> {booking.address}</p>
                    <p><span className="font-medium">Phone:</span> {booking.phone}</p>
                    {driverInfo.estimatedArrival && (
                      <p><span className="font-medium">Estimated Arrival:</span> {formatTimestamp(driverInfo.estimatedArrival)?.time}</p>
                    )}
                  </div>
                </div>

                {/* Driver Information */}
                {(driverInfo.name || driverInfo.phone) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Driver Information
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      {driverInfo.name && (
                        <p><span className="font-medium">Driver:</span> {driverInfo.name}</p>
                      )}
                      {driverInfo.phone && (
                        <p className="flex items-center">
                          <span className="font-medium mr-2">Contact:</span>
                          <a 
                            href={`tel:${driverInfo.phone}`}
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {driverInfo.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Review Prompt Modal */}
      <DeliveryReviewPrompt
        isOpen={showReviewPrompt}
        onClose={() => setShowReviewPrompt(false)}
        booking={booking}
      />
    </div>
  );
};

export default DeliveryTracker;