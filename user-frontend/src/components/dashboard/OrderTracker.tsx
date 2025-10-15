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

  // Fetch tracking progress for this booking
  const fetchTrackingProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .rpc('get_tracking_progress', { booking_id: booking.id });
      
      if (error) {
        console.error('Error fetching tracking progress:', error);
        setError('Failed to load tracking information');
        return;
      }
      
      setTrackingStages(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
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

        {/* Horizontal Progress Tracker */}
         <div className="relative px-2 sm:px-0">
           {/* Progress Line Background */}
           <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 rounded-full hidden sm:block"></div>
           <div className="absolute top-6 left-4 right-4 h-0.5 bg-gray-200 rounded-full sm:hidden"></div>
           
           {/* Animated Progress Line */}
           <div 
             className="absolute top-6 h-0.5 bg-gradient-to-r from-green-400 to-purple-500 rounded-full transition-all duration-1000 ease-out hidden sm:block"
             style={{ 
               left: '1.5rem',
               width: `calc(${Math.max(0, (progressPercentage / 100) * 100)}% - 3rem)`,
               maxWidth: 'calc(100% - 3rem)'
             }}
           ></div>
           <div 
             className="absolute top-6 h-0.5 bg-gradient-to-r from-green-400 to-purple-500 rounded-full transition-all duration-1000 ease-out sm:hidden"
             style={{ 
               left: '1rem',
               width: `calc(${Math.max(0, (progressPercentage / 100) * 100)}% - 2rem)`,
               maxWidth: 'calc(100% - 2rem)'
             }}
           ></div>

           {/* Stage Nodes */}
           <div className="flex justify-between items-center relative overflow-x-auto">
             {trackingStages.map((stage, index) => {
               const isCompleted = stage.completed;
               const isCurrent = index === currentStageIndex;
               const isFuture = index > currentStageIndex && currentStageIndex !== -1;
               const timestamp = formatTimestamp(stage.timestamp);

               return (
                 <div key={stage.stage_name} className="flex flex-col items-center group relative min-w-0 flex-shrink-0">
                   {/* Stage Node */}
                   <div className={`
                     relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110
                     ${isCompleted 
                       ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                       : isCurrent 
                         ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/50 animate-pulse' 
                         : 'bg-gray-100 border-gray-300 text-gray-400'
                     }
                   `}>
                     {isCompleted ? (
                       <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                     ) : isCurrent ? (
                       <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-ping"></div>
                     ) : (
                       <div className="w-3 h-3 sm:w-4 sm:h-4">
                         {getStageIcon(stage, index)}
                       </div>
                     )}
                     
                     {/* Glow effect for current stage */}
                     {isCurrent && (
                       <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping"></div>
                     )}
                   </div>

                   {/* Stage Label */}
                   <div className="mt-2 sm:mt-3 text-center max-w-16 sm:max-w-20">
                     <p className={`text-xs font-medium transition-colors duration-300 leading-tight ${
                       isCompleted 
                         ? 'text-green-700' 
                         : isCurrent 
                           ? 'text-purple-700' 
                           : 'text-gray-500'
                     }`}>
                       {stage.stage_label}
                     </p>
                     
                     {/* Timestamp - Hidden on mobile, shown on hover/desktop */}
                     {timestamp && (
                       <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                         {timestamp.time}
                       </p>
                     )}
                   </div>

                   {/* Hover Tooltip - Enhanced for mobile */}
                   {timestamp && (
                     <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                       <div className="text-center">
                         <div className="font-medium">{stage.stage_label}</div>
                         <div className="text-gray-300">{timestamp.date}</div>
                         <div className="text-gray-300">{timestamp.time}</div>
                         {stage.notes && (
                           <div className="text-gray-300 text-xs mt-1 max-w-32">{stage.notes}</div>
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
        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
          <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
            <Phone className="w-4 h-4 mr-2" />
            Call Support
          </button>
          <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;