import { useState, useEffect } from "react";
import { 
  Truck, 
  MapPin, 
  Calendar,
  Clock,
  Package,
  CheckCircle,
  ArrowRight,
  Plus,
  Phone,
  MessageSquare,
  X
} from "lucide-react";
import { useSupabaseData } from "../../contexts/SupabaseDataContext";
import { useRealtimeData } from "../../hooks/useRealtimeData";

const DryCleaningPage = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'tracker'>('request');
  const [serviceType, setServiceType] = useState<'pickup' | 'dropoff'>('pickup');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const { state: { currentUser }, createBooking, createAddress } = useSupabaseData();

  // Address collector modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
  });

  const openAddressModal = () => setShowAddressModal(true);
  const closeAddressModal = () => {
    setShowAddressModal(false);
    setNewAddress({ type: 'home', street: '', city: '', state: '', zip_code: '', is_default: false });
  };

  const handleSaveAddress = async () => {
    if (!currentUser) {
      alert('Please log in to add an address');
      return;
    }

    if (!newAddress.street.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.zip_code.trim()) {
      alert('Please fill in all required address fields');
      return;
    }

    try {
      await createAddress({
        type: newAddress.type,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        zip_code: newAddress.zip_code,
        is_default: newAddress.is_default,
        // user_id will be filled in by context
      } as any);

      alert('Address added successfully');
      closeAddressModal();
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };
  
  // Use real-time data for bookings and addresses
  const { data: allBookings, loading: bookingsLoading, error: bookingsError } = useRealtimeData('bookings');
  const { data: allAddresses, loading: addressesLoading, error: addressesError } = useRealtimeData('addresses');
  
  // Filter data for current user
  const bookings = allBookings.filter(booking => booking.user_id === currentUser?.id);
  const addresses = allAddresses.filter(address => address.user_id === currentUser?.id);

  // Get user's saved addresses
  const savedAddresses = addresses
    .map(address => ({
      id: address.id,
      label: address.type || 'Address',
      address: `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`
    }));

  // Get dry cleaning orders from real bookings
  const activeOrders = bookings
    .filter(booking => 
      (booking.service_type === 'dry_cleaning' || booking.service_name?.toLowerCase().includes('dry'))
    )
    .map(booking => {
      // Generate steps based on booking status and dates
      const steps = [
        { 
          label: 'Picked Up', 
          completed: ['confirmed', 'in_progress', 'completed'].includes(booking.status),
          time: booking.pickup_date ? new Date(booking.pickup_date).toLocaleString() : null
        },
        { 
          label: 'In Cleaning', 
          completed: ['in_progress', 'completed'].includes(booking.status),
          time: booking.status === 'in_progress' || booking.status === 'completed' ? 
                new Date(booking.updated_at).toLocaleString() : null
        },
        { 
          label: 'Out for Delivery', 
          completed: booking.delivery_status === 'out_for_delivery' || booking.status === 'completed',
          time: booking.delivery_status === 'out_for_delivery' || booking.status === 'completed' ? 
                new Date(booking.updated_at).toLocaleString() : null
        },
        { 
          label: 'Delivered', 
          completed: booking.status === 'completed',
          time: booking.status === 'completed' ? new Date(booking.updated_at).toLocaleString() : null
        }
      ];

      const currentStep = steps.findIndex(step => !step.completed);

      return {
        id: booking.id.slice(-6).toUpperCase(),
        status: booking.status,
        items: booking.item_details ? 
               (typeof booking.item_details === 'string' ? 
                booking.item_details.split(',') : 
                [booking.item_details]) : 
               [`${booking.item_count || 1} items`],
        pickupDate: booking.service_date,
        estimatedDelivery: booking.estimated_completion || booking.service_date,
        currentStep: currentStep === -1 ? steps.length - 1 : currentStep,
        steps
      };
    });

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];

  const handleSubmitRequest = async () => {
    if (!selectedAddress || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      alert('Please log in to submit a request');
      return;
    }
    
    try {
      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      
      await createBooking({
         user_id: currentUser.id,
         service_type: 'dry_cleaning',
         service_name: `Dry Cleaning - ${serviceType === 'pickup' ? 'Pickup' : 'Drop-off'}`,
         date: selectedDate,
         service_date: selectedDate,
         time: selectedTime,
         address: selectedAddressData ? 
           `${selectedAddressData.street}, ${selectedAddressData.city}, ${selectedAddressData.state} ${selectedAddressData.zip_code}` :
           selectedAddress,
         phone: currentUser.phone || '',
         status: 'pending',
         total_amount: 0, // Will be calculated later
         special_instructions: specialInstructions
       });

      alert(`${serviceType === 'pickup' ? 'Pickup' : 'Drop-off'} request submitted successfully!`);
      
      // Reset form
      setSelectedAddress('');
      setSelectedDate('');
      setSelectedTime('');
      setSpecialInstructions('');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked-up': return 'text-blue-600 bg-blue-100';
      case 'in-cleaning': return 'text-yellow-600 bg-yellow-100';
      case 'out-for-delivery': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'picked-up': return 'Picked Up';
      case 'in-cleaning': return 'In Cleaning';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Dry Cleaning Services</h1>
        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Schedule pickups, drop-offs, and track your orders</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex px-3 sm:px-4 lg:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('request')}
              className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'request'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Request Service
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ml-4 sm:ml-8 ${
                activeTab === 'tracker'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Track Orders ({activeOrders.length})
            </button>
          </nav>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          {activeTab === 'request' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              {addressesLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-500 text-xs sm:text-sm">Loading addresses...</p>
                </div>
              ) : (
                <>
              {/* Service Type Selection */}
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Choose Service Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setServiceType('pickup')}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors touch-manipulation min-h-[80px] ${
                      serviceType === 'pickup'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Truck className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${serviceType === 'pickup' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Request Pickup</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">We'll come to you</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setServiceType('dropoff')}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors touch-manipulation min-h-[80px] ${
                      serviceType === 'dropoff'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <MapPin className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${serviceType === 'dropoff' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Book Drop-off</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Bring items to us</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Address Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {serviceType === 'pickup' ? 'Pickup Address' : 'Your Address'} *
                </label>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                >
                  <option value="">Select an address</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} - {address.address}
                    </option>
                  ))}
                </select>
                <button onClick={openAddressModal} className="mt-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center touch-manipulation min-h-[44px]">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Add New Address
                </button>
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md p-4 sm:p-6 shadow-xl border border-transparent dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Add Address</h3>
                        <button onClick={closeAddressModal} className="text-gray-500 hover:text-gray-700">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'home' | 'work' | 'other' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Street *</label>
                          <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State *</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                          <input
                            type="text"
                            value={newAddress.zip_code}
                            onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            id="isDefault"
                            type="checkbox"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="isDefault" className="ml-2 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">Set as default</label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={closeAddressModal} className="px-3 py-2 text-xs sm:text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                          <button onClick={handleSaveAddress} className="px-3 py-2 text-xs sm:text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Save Address</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    {serviceType === 'pickup' ? 'Pickup Date' : 'Drop-off Date'} *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] bg-white dark:bg-gray-900 ${selectedDate ? 'text-gray-900 dark:text-gray-200' : 'date-empty text-gray-500 dark:text-gray-400'}`}
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    Preferred Time *
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className={`w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] bg-white dark:bg-gray-900 ${selectedTime ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  placeholder="Any special handling instructions, stain details, or delivery preferences..."
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitRequest}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[48px]"
              >
                Schedule {serviceType === 'pickup' ? 'Pickup' : 'Drop-off'}
              </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              {bookingsLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-500 text-xs sm:text-sm">Loading orders...</p>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
                  <p className="text-gray-600 mb-4 text-xs sm:text-sm">You don't have any orders in progress right now.</p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    Request Service
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Picked up: {new Date(order.pickupDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)} self-start sm:self-auto`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Items:</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {order.items.map((item, index) => (
                            <span key={index} className="bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 border">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Progress Tracker */}
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Progress:</p>
                        <div className="space-y-2 sm:space-y-3">
                          {order.steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.completed 
                                  ? 'bg-green-500 text-white' 
                                  : index === order.currentStep 
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                              }`}>
                                {step.completed ? (
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <span className="text-xs font-bold">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm font-medium ${
                                  step.completed ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {step.label}
                                </p>
                                {step.time && (
                                  <p className="text-xs text-gray-500">{step.time}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center touch-manipulation min-h-[44px] px-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Call
                          </button>
                          <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center touch-manipulation min-h-[44px] px-2">
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DryCleaningPage;