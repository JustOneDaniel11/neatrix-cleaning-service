import { useState, useEffect } from "react";
import { Search, Plus, ArrowLeft, Package, Clock, CheckCircle } from "lucide-react";
import { useSupabaseData } from "../../contexts/SupabaseDataContext";
import { useRealtimeData } from "../../hooks/useRealtimeData";
import OrderTracker from "./OrderTracker";
import type { Booking } from "../../contexts/SupabaseDataContext";
import { formatTrackingCodeDisplay, isValidTrackingCode } from "../../lib/trackingUtils";
import { supabase } from "../../lib/supabase";

interface OrderInboxProps {
  className?: string;
}

const OrderInbox = ({ className = "" }: OrderInboxProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isLoadingTrackingCode, setIsLoadingTrackingCode] = useState(false);

  const { state: { currentUser } } = useSupabaseData();

  // Use real-time data for bookings
  const { data: allBookings, loading: bookingsLoading, error: bookingsError } = useRealtimeData<Booking>('bookings');
  
  // Filter bookings for current user and dry cleaning orders
  const userBookings = allBookings.filter(booking => 
    booking.user_id === currentUser?.id &&
    (booking.service_type === 'dry_cleaning' || booking.service_name?.toLowerCase().includes('dry')) &&
    booking.status !== 'cancelled'
  );

  // Filter bookings based on search query
  const filteredBookings = userBookings.filter(booking => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.service_name?.toLowerCase().includes(searchLower) ||
      booking.id.toLowerCase().includes(searchLower) ||
      booking.tracking_stage?.toLowerCase().includes(searchLower) ||
      (isValidTrackingCode(booking.id) ? formatTrackingCodeDisplay(booking.id) : booking.id.slice(0, 8)).toLowerCase().includes(searchLower)
    );
  });

  // Get selected booking
  const selectedBooking = selectedOrderId 
    ? filteredBookings.find(booking => booking.id === selectedOrderId)
    : null;

  // Auto-select first booking if none selected and bookings exist
  useEffect(() => {
    if (!selectedOrderId && filteredBookings.length > 0) {
      setSelectedOrderId(filteredBookings[0].id);
    }
  }, [filteredBookings, selectedOrderId]);

  // Handle order selection
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowMobileDetails(true);
  };

  // Handle back to list on mobile
  const handleBackToList = () => {
    setShowMobileDetails(false);
  };

  // Handle track new order
  const handleTrackNewOrder = async () => {
    if (!trackingCode.trim()) return;

    setIsLoadingTrackingCode(true);
    try {
      // Search for booking by tracking code or ID
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`id.eq.${trackingCode},id.ilike.%${trackingCode}%`)
        .eq('user_id', currentUser?.id)
        .single();

      if (error || !booking) {
        alert('Order not found. Please check your tracking code.');
        return;
      }

      // Select the found booking
      setSelectedOrderId(booking.id);
      setTrackingCode("");
      setShowMobileDetails(true);
    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Failed to track order. Please try again.');
    } finally {
      setIsLoadingTrackingCode(false);
    }
  };

  // Get current stage display
  const getCurrentStage = (booking: Booking) => {
    const stage = booking.tracking_stage || 'pending';
    return stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ');
  };

  // Get stage color with improved styling
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'sorting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stain_removing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'washing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'drying': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ironing': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'quality_check': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'ready_for_pickup': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'picked_up': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get stage icon
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'ready_for_pickup':
      case 'picked_up':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`flex h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm ${className}`}>
      {/* Left Panel - Orders List */}
      <div className={`w-full md:w-1/3 lg:w-2/5 border-r border-gray-200 dark:border-gray-700 flex flex-col ${showMobileDetails ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Track Orders</h2>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 transition-all duration-200"
            />
          </div>

          {/* Track New Order */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter tracking code..."
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrackNewOrder()}
              className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm transition-all duration-200"
            />
            <button
              onClick={handleTrackNewOrder}
              disabled={!trackingCode.trim() || isLoadingTrackingCode}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md active:scale-95"
            >
              {isLoadingTrackingCode ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Track'
              )}
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto">
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Loading orders...</span>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No matching orders' : 'No orders found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {searchQuery 
                  ? 'Try adjusting your search terms or check the spelling'
                  : 'You don\'t have any dry cleaning orders yet. Place your first order to get started!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {filteredBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  onClick={() => handleOrderSelect(booking.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 transform hover:scale-[1.02] active:scale-[0.98] ${
                    selectedOrderId === booking.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-md'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate pr-2">
                      {booking.service_name || 'Dry Cleaning Service'}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${getStageColor(booking.tracking_stage || 'pending')}`}>
                      {getStageIcon(booking.tracking_stage || 'pending')}
                      {getCurrentStage(booking)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                      #{isValidTrackingCode(booking.id) ? formatTrackingCodeDisplay(booking.id) : booking.id.slice(0, 8).toUpperCase()}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Order Details */}
      <div className={`flex-1 flex flex-col ${showMobileDetails ? 'flex' : 'hidden md:flex'}`}>
        {/* Mobile Header with Back Button */}
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleBackToList}
            className="mr-3 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Details</h2>
        </div>

        {/* Order Details Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedBooking ? (
            <div className="p-4 md:p-6">
              <OrderTracker booking={selectedBooking} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="max-w-sm">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Select an order to view details
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Choose an order from the list to see its tracking progress and detailed information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderInbox;