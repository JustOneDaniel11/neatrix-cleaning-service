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
  Home,
  Waves,
  Navigation
} from 'lucide-react';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../contexts/SupabaseDataContext';
import DeliveryTracker from './DeliveryTracker';

const formatCurrencyNGN = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount) || 0);

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
  // Add context and review modal state
  const { state, createReview } = useSupabaseData();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  // Delivery tracking modal state
  const [showDeliveryTracking, setShowDeliveryTracking] = useState(false);

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
    let currentStage = data.tracking_stage;
    const pickupOption = data.pickup_option || 'pickup';
    const stageTimestamps = data.stage_timestamps || {};
    const stageNotes = data.stage_notes || {};
    
    // Choose sensible default stage based on booking status
    if (!currentStage) {
      const status = (booking.status || '').toLowerCase();
      if (status === 'completed') {
        currentStage = pickupOption === 'pickup' ? 'picked_up' : 'delivered';
      } else if (status === 'in_progress' || status === 'confirmed') {
        currentStage = 'sorting';
      } else {
        currentStage = 'sorting';
      }
    }
    
    // Dynamic first stage based on pickup_option
    // Only show if tracking has started (tracking_stage exists)
    const intakeStage = data.tracking_stage ? [
      { 
        name: 'intake', 
        label: pickupOption === 'pickup' ? 'Picked Up' : 'Dropped Off'
      }
    ] : [];

    // Define the standard processing stages
    const standardStages = [
      { name: 'sorting', label: 'Sorting' },
      { name: 'stain_removing', label: 'Stain Removal' },
      { name: 'washing', label: 'Washing' },
      { name: 'drying', label: 'Drying' },
      { name: 'ironing', label: 'Ironing' },
      { name: 'packing', label: 'Packing' }
    ];
    
    // Define final stages based on delivery preference
    const finalStages = pickupOption === 'pickup' 
      ? [
          { name: 'ready_for_pickup', label: 'Ready for Pickup' },
          { name: 'picked_up', label: 'Picked Up' }
        ]
      : [
          { name: 'ready_for_delivery', label: 'Ready for Delivery' },
          { name: 'delivered', label: 'Delivered' }
        ];
    
    const allStages = [...intakeStage, ...standardStages, ...finalStages];
    
    // Find current stage index
    const currentStageIndex = allStages.findIndex(stage => stage.name === currentStage);
    
    // Create tracking stages array
    return allStages.map((stage, index) => ({
      stage_name: stage.name,
      stage_label: stage.label,
      completed: index <= currentStageIndex,
      timestamp: stage.name === 'intake' 
        ? (stageTimestamps['picked_up'] || stageTimestamps['dropped_off'] || null)
        : (stageTimestamps[stage.name] || null),
      notes: stageNotes[stage.name] || ''
    }));
  };

  // Create fallback tracking stages when database function is not available
  const createFallbackTrackingStages = (): TrackingStage[] => {
    const pickupOption = (booking as any).pickup_option || 'pickup';
    const hasTrackingStage = (booking as any).tracking_stage;
    
    // Dynamic first stage - only show if tracking has started
    const intakeStage = hasTrackingStage ? [
      { 
        name: 'intake', 
        label: pickupOption === 'pickup' ? 'Picked Up' : 'Dropped Off'
      }
    ] : [];
    
    // Processing stages
    const processingStages = [
      { name: 'sorting', label: 'Sorting' },
      { name: 'stain_removing', label: 'Stain Removal' },
      { name: 'washing', label: 'Washing' },
      { name: 'drying', label: 'Drying' },
      { name: 'ironing', label: 'Ironing' },
      { name: 'packing', label: 'Packing' }
    ];

    // Choose branch based on pickup_option
    const finalStages = pickupOption === 'pickup'
      ? [
          { name: 'ready_for_pickup', label: 'Ready for Pickup' },
          { name: 'picked_up', label: 'Picked Up' }
        ]
      : [
          { name: 'ready_for_delivery', label: 'Ready for Delivery' },
          { name: 'delivered', label: 'Delivered' }
        ];

    const allStages = [...intakeStage, ...processingStages, ...finalStages];
    
    // For fallback, show appropriate stages as completed based on tracking status
    const isCompleted = (booking.status || '').toLowerCase() === 'completed';
    const hasStartedTracking = hasTrackingStage;
    
    return allStages.map((stage, index) => ({
      stage_name: stage.name,
      stage_label: stage.label,
      completed: isCompleted ? true : (hasStartedTracking && index === 0),
      timestamp: isCompleted && index === allStages.length - 1
        ? (booking as any).updated_at || booking.created_at
        : (hasStartedTracking && index === 0 ? booking.created_at : null),
      notes: isCompleted && index === allStages.length - 1
        ? 'Order completed'
        : (hasStartedTracking && index === 0 ? 'Order received and processing started' : '')
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
      'intake': <Package className="w-4 h-4" />,
      'sorting': <Package className="w-4 h-4" />,
      'stain_removing': <Droplets className="w-4 h-4" />,
      'washing': <Loader2 className="w-4 h-4" />,
      'drying': <Waves className="w-4 h-4" />,
      'ironing': <Shirt className="w-4 h-4" />,
      'packing': <Gift className="w-4 h-4" />,
      'ready_for_delivery': <Truck className="w-4 h-4" />,
      'ready_for_pickup': <MapPin className="w-4 h-4" />,
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
      'intake': 'Items received — picked up or dropped off',
      'sorting': 'Your items are being sorted and cataloged',
      'stain_removing': 'Stains are being treated with specialized solutions',
      'washing': 'Your items are being carefully cleaned',
      'drying': 'Items are being dried to optimal levels',
      'ironing': 'Your items are being pressed and finished',
      'packing': 'Your items are being packaged for delivery/pickup',
      'ready_for_delivery': 'Your order is ready and will be delivered soon',
      'ready_for_pickup': 'Your order is ready for pickup at our location',
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

  // Gate tracking visibility: only show after confirmation or when in progress
  const allowTracking = ['confirmed', 'in_progress', 'completed'].includes(booking.status || '');
  if (!allowTracking) {
    return (
      <div className="bg-white rounded-lg p-6 border border-amber-200">
        <div className="flex items-center text-amber-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Tracking is unavailable while the order is pending confirmation.</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">You’ll be able to track progress once the booking is confirmed by admin or marked as In Progress.</p>
      </div>
    );
  }

  const currentStage = getCurrentStageInfo();
  const progressPercentage = getProgressPercentage();
  const currentStageIndex = trackingStages.findIndex(s => !s.completed);
  const isFinalStageCompleted = progressPercentage === 100 || (
    trackingStages.length > 0 && trackingStages[trackingStages.length - 1].completed
  );

  const handleOpenReview = () => setIsReviewOpen(true);
  const handleCloseReview = () => {
    setIsReviewOpen(false);
    setReviewText('');
    setRating('');
  };

  const handleSubmitReview = async () => {
    if (!state?.authUser) {
      alert('Please log in to submit a review');
      return;
    }
    if (!reviewText.trim()) {
      alert('Please write a short review');
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview({
        user_id: state.authUser.id,
        booking_id: booking.id,
        rating: typeof rating === 'number' ? rating : 5,
        comment: reviewText.trim(),
        service_type: booking.service_type,
        status: 'pending'
      });
      handleCloseReview();
      alert('Thanks! Your review has been submitted for approval.');
    } catch (e) {
      console.error('Error submitting review', e);
      alert('Failed to submit review. Please try again later.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Check if Track Delivery button should be shown
  const shouldShowTrackDelivery = () => {
    const status = booking.status?.toLowerCase() || '';
    return (booking as any).pickup_option === 'delivery' && 
           (status === 'completed' || status === 'ready for delivery');
  };

  // Handle Track Delivery button click
  const handleTrackDelivery = () => {
    setShowDeliveryTracking(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Order #{booking.id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {booking.service_name} • {new Date(booking.service_date).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              progressPercentage === 100 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
            }`}>
              {progressPercentage === 100 ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Current Stage Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-600 mb-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {progressPercentage === 100 ? (
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentStage.label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentStage.description}</p>
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
            <div className="relative px-6 py-4">
              {/* Progress Line Background */}
              <div className="absolute top-12 left-12 right-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              
              {/* Animated Progress Line with Gradient */}
              <div 
                className="absolute top-12 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ 
                  left: '3rem',
                  width: `calc(${Math.max(0, (progressPercentage / 100) * (trackingStages.length > 1 ? ((trackingStages.length - 1) / trackingStages.length) * 100 : 0))}% - 0rem)`,
                  maxWidth: 'calc(100% - 6rem)',
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)'
                }}
              ></div>

              {/* Stage Nodes Container with Proper Grid Layout */}
              <div className="grid grid-cols-auto gap-0 relative" style={{ gridTemplateColumns: `repeat(${trackingStages.length}, 1fr)` }}>
                {trackingStages.map((stage, index) => {
                  const isCompleted = stage.completed;
                  const isCurrent = index === currentStageIndex;
                  const timestamp = formatTimestamp(stage.timestamp);
                  const isInactive = !isCompleted && !isCurrent;

                  return (
                    <div key={stage.stage_name} className="flex flex-col items-center group relative">
                      {/* Stage Node with Enhanced Styling */}
                       <div className={`
                         relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 transform hover:scale-110 cursor-pointer z-10
                         ${isCompleted 
                           ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg shadow-green-500/30' 
                           : isCurrent 
                             ? 'bg-gradient-to-br from-purple-500 to-blue-600 border-purple-400 text-white shadow-lg shadow-purple-500/50' 
                             : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-60 dark:opacity-40'
                         }
                       `}>
                         {isCompleted ? (
                           <CheckCircle className="w-6 h-6" />
                         ) : isCurrent ? (
                           <div className="relative">
                             <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                             <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                           </div>
                         ) : (
                           <div className="w-5 h-5">
                             {getStageIcon(stage, index)}
                           </div>
                         )}
                        
                        {/* Enhanced Glow Effect for Current Stage */}
                        {isCurrent && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-40 animate-pulse"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-20 animate-ping"></div>
                          </>
                        )}
                      </div>

                      {/* Stage Label with Better Typography */}
                      <div className="mt-4 text-center w-full px-2">
                        <p className={`text-xs font-semibold transition-all duration-300 leading-tight break-words ${
                          isCompleted 
                            ? 'text-green-700 dark:text-green-400' 
                            : isCurrent 
                              ? 'text-purple-700 dark:text-purple-400' 
                              : 'text-gray-500 dark:text-gray-400 opacity-60'
                        }`}>
                          {stage.stage_label}
                        </p>
                        
                        {/* Timestamp with Better Styling */}
                        {timestamp && (isCompleted || isCurrent) && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                            {timestamp.time}
                          </p>
                        )}
                      </div>

                      {/* Enhanced Tooltip with Stage Descriptions */}
                      <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-2xl border border-gray-700">
                        <div className="text-center">
                          <div className="font-semibold text-white">{stage.stage_label}</div>
                          <div className="text-gray-300 mt-1">
                            {stage.stage_name === 'intake' && 'Items received and logged'}
                            {stage.stage_name === 'sorting' && 'Clothes are being categorized'}
                            {stage.stage_name === 'stain_removing' && 'Treating stains and spots'}
                            {stage.stage_name === 'washing' && 'Deep cleaning in progress'}
                            {stage.stage_name === 'drying' && 'Items are being dried'}
                            {stage.stage_name === 'ironing' && 'Pressing and finishing'}
                            {stage.stage_name === 'packing' && 'Carefully packaging items'}
                            {stage.stage_name === 'ready_for_pickup' && 'Ready for collection'}
                            {stage.stage_name === 'picked_up' && 'Successfully collected'}
                            {stage.stage_name === 'ready_for_delivery' && 'Prepared for delivery'}
                            {stage.stage_name === 'delivered' && 'Successfully delivered'}
                          </div>
                          {timestamp && (
                            <>
                              <div className="text-gray-400 text-xs mt-2">{timestamp.date}</div>
                              <div className="text-gray-400 text-xs">{timestamp.time}</div>
                            </>
                          )}
                          {stage.notes && (
                            <div className="text-gray-300 text-xs mt-2 max-w-40 break-words">{stage.notes}</div>
                          )}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Responsive Horizontal Scrolling */}
            <div className="sm:hidden">
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-8 px-4 min-w-max">
                  {trackingStages.map((stage, index) => {
                    const isCompleted = stage.completed;
                    const isCurrent = index === currentStageIndex;
                    const timestamp = formatTimestamp(stage.timestamp);
                    const isInactive = !isCompleted && !isCurrent;

                    return (
                      <div key={stage.stage_name} className="flex flex-col items-center group relative">
                        {/* Mobile Stage Node */}
                         <div className={`
                           relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 transform active:scale-95
                           ${isCompleted 
                             ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg shadow-green-500/30' 
                             : isCurrent 
                               ? 'bg-gradient-to-br from-purple-500 to-blue-600 border-purple-400 text-white shadow-lg shadow-purple-500/50' 
                               : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-60'
                           }
                         `}>
                           {isCompleted ? (
                             <CheckCircle className="w-5 h-5" />
                           ) : isCurrent ? (
                             <div className="relative">
                               <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                               <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                             </div>
                           ) : (
                             <div className="w-4 h-4">
                               {getStageIcon(stage, index)}
                             </div>
                           )}
                          
                          {/* Mobile Glow Effect */}
                          {isCurrent && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-30 animate-pulse"></div>
                          )}
                        </div>

                        {/* Mobile Stage Label */}
                        <div className="mt-3 text-center w-20">
                          <p className={`text-xs font-semibold transition-colors duration-300 leading-tight ${
                            isCompleted 
                              ? 'text-green-700 dark:text-green-400' 
                              : isCurrent 
                                ? 'text-purple-700 dark:text-purple-400' 
                                : 'text-gray-500 dark:text-gray-400 opacity-60'
                            }`}>
                            {stage.stage_label}
                          </p>
                          
                          {timestamp && (isCompleted || isCurrent) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {timestamp.time}
                            </p>
                          )}
                        </div>

                        {/* Connection Line for Mobile */}
                        {index < trackingStages.length - 1 && (
                          <div className={`absolute top-7 left-14 w-8 h-0.5 transition-colors duration-500 ${
                            isCompleted ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Order Details</h5>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>Items: {booking.item_count || 1} pieces</p>
              <p>Service: {booking.service_name}</p>
              <p>Total: {formatCurrencyNGN(booking.total_amount)}</p>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Delivery Info</h5>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
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
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Track Delivery Button - Only show for delivery orders that are completed or ready */}
          {shouldShowTrackDelivery() && (
            <button 
              onClick={handleTrackDelivery}
              className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-green-600 dark:border-green-700 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 active:bg-green-800 dark:active:bg-green-900 transition-colors min-h-[44px] touch-manipulation shadow-sm"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Track Delivery
            </button>
          )}
          
          <button 
             onClick={() => window.open('tel:+2349034842430', '_self')}
             className="flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 active:bg-blue-200 dark:active:bg-blue-900/40 transition-colors min-h-[44px] touch-manipulation"
           >
            <Phone className="w-5 h-5 mr-2" />
            Call Support
          </button>
          <button 
            onClick={() => navigate('/support')}
            className="flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 active:bg-blue-200 dark:active:bg-blue-900/40 transition-colors min-h-[44px] touch-manipulation"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Message
          </button>
        </div>
      </div>

      {/* Delivery Tracking Modal */}
       <DeliveryTracker 
         booking={booking}
         isOpen={showDeliveryTracking}
         onClose={() => setShowDeliveryTracking(false)}
       />
    </div>
  );
};

export default OrderTracker;