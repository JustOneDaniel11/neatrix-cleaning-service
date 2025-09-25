import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  CreditCard, 
  User, 
  Settings, 
  LogOut,
  Plus,
  Eye,
  CheckCircle,
  Truck,
  Home,
  Menu,
  X,
  Bell,
  MessageSquare,
  HelpCircle,
  Star,
  Repeat,
  Shirt,
  BarChart3,
  Phone
} from "lucide-react";
import BookingSystem from "@/components/BookingSystem";
import PickupDelivery from "@/components/PickupDelivery";
import PaymentIntegration from "@/components/PaymentIntegration";
import QuickBookingForm from "@/components/QuickBookingForm";
import { useSupabaseData, formatCurrency, formatDate } from "@/contexts/SupabaseDataContext";

const DashboardPage = () => {
  const { state, signOut, fetchUserBookings } = useSupabaseData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false
    }
  ]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Payment method handlers
  const handleSetDefaultPayment = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    alert('Payment method set as default successfully!');
  };

  const handleEditPayment = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      // In a real app, this would open a modal or navigate to an edit form
      const newExpiry = prompt(`Edit expiry date for card ending in ${method.last4} (MM/YY):`, `${method.expiryMonth}/${method.expiryYear}`);
      if (newExpiry && newExpiry.includes('/')) {
        const [month, year] = newExpiry.split('/');
        setPaymentMethods(prev =>
          prev.map(m => m.id === methodId ? { ...m, expiryMonth: month, expiryYear: year } : m)
        );
        alert('Payment method updated successfully!');
      }
    }
  };

  const handleRemovePayment = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault) {
      alert('Cannot remove default payment method. Please set another method as default first.');
      return;
    }
    
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      alert('Payment method removed successfully!');
    }
  };

  // Addresses state and handlers
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      label: 'Home',
      address: '123 Main Street, City, State 12345',
      isDefault: true
    },
    {
      id: '2',
      label: 'Office',
      address: '456 Business Ave, City, State 12345',
      isDefault: false
    }
  ]);

  const handleEditAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (address) {
      // In a real app, this would open a modal or navigate to an edit form
      const newAddress = prompt(`Edit address for ${address.label}:`, address.address);
      if (newAddress && newAddress.trim()) {
        setAddresses(prev =>
          prev.map(a => a.id === addressId ? { ...a, address: newAddress.trim() } : a)
        );
        alert('Address updated successfully!');
      }
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (address?.isDefault && addresses.length > 1) {
      alert('Cannot delete default address. Please set another address as default first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(a => a.id !== addressId));
      alert('Address deleted successfully!');
    }
  };

  const handleAddAddress = () => {
    const label = prompt('Enter address label (e.g., Home, Office):');
    if (!label || !label.trim()) return;
    
    const address = prompt('Enter the full address:');
    if (!address || !address.trim()) return;
    
    const newAddress = {
      id: Date.now().toString(),
      label: label.trim(),
      address: address.trim(),
      isDefault: addresses.length === 0
    };
    
    setAddresses(prev => [...prev, newAddress]);
    alert('Address added successfully!');
  };

  // Subscription management handlers
  const [currentPlan, setCurrentPlan] = useState({
    name: 'Premium Weekly',
    price: 120,
    status: 'active'
  });

  const handleUpgradePlan = () => {
    if (confirm('Upgrade to Premium Weekly plan for $120/week?')) {
      setCurrentPlan({ name: 'Premium Weekly', price: 120, status: 'active' });
      alert('Plan upgraded successfully! Changes will take effect on your next billing cycle.');
    }
  };

  const handleModifySchedule = () => {
    const newSchedule = prompt('Enter your preferred cleaning schedule (e.g., "Every Monday at 9 AM"):');
    if (newSchedule && newSchedule.trim()) {
      alert(`Schedule updated to: ${newSchedule.trim()}`);
    }
  };

  const handlePauseSubscription = () => {
    if (confirm('Are you sure you want to pause your subscription? You can resume it anytime.')) {
      setCurrentPlan(prev => ({ ...prev, status: 'paused' }));
      alert('Subscription paused successfully. You can resume it anytime from your dashboard.');
    }
  };

  const handleCancelPlan = () => {
    const confirmation = prompt('Type "CANCEL" to confirm cancellation of your subscription:');
    if (confirmation === 'CANCEL') {
      setCurrentPlan(prev => ({ ...prev, status: 'cancelled' }));
      alert('Subscription cancelled successfully. You will continue to receive service until the end of your current billing period.');
    } else if (confirmation !== null) {
      alert('Cancellation not confirmed. Please type "CANCEL" exactly to proceed.');
    }
  };

  const handleUpgradeToDeluxe = () => {
    if (confirm('Upgrade to Deluxe Weekly plan for $150/week? This includes deep cleaning and premium products.')) {
      setCurrentPlan({ name: 'Deluxe Weekly', price: 150, status: 'active' });
      alert('Plan upgraded to Deluxe! Changes will take effect on your next billing cycle.');
    }
  };

  const handleDowngradeToBasic = () => {
    if (confirm('Downgrade to Basic Weekly plan for $100/week? Some features will be removed.')) {
      setCurrentPlan({ name: 'Basic Weekly', price: 100, status: 'active' });
      alert('Plan downgraded to Basic. Changes will take effect on your next billing cycle.');
    }
  };

  // Dry cleaning tracker handlers
  const [dryCleaningOrders, setDryCleaningOrders] = useState([
    {
      id: 'DC001',
      status: 'processing',
      items: [
        { name: '2x Dress Shirts', price: 20 },
        { name: '1x Suit', price: 25 },
        { name: '2x Pants', price: 15 }
      ],
      total: 60,
      pickupDate: 'Dec 16, 2024'
    },
    {
      id: 'DC002',
      status: 'ready',
      items: [
        { name: '3x Shirts', price: 30 },
        { name: '1x Dress', price: 20 }
      ],
      total: 50,
      pickupDate: 'Dec 15, 2024'
    }
  ]);

  const handleTrackOrder = (orderId: string) => {
    const order = dryCleaningOrders.find(o => o.id === orderId);
    if (order) {
      alert(`Order ${orderId} Status:\n\nItems: ${order.items.map(item => item.name).join(', ')}\nTotal: ${formatCurrency(order.total)}\nStatus: ${order.status === 'processing' ? 'Currently being processed' : 'Ready for pickup'}`);
    }
  };

  const handleContactSupport = () => {
    const message = "Hello! I need help with my dry cleaning order. Can you assist me?";
    const whatsappUrl = `https://wa.me/2348031234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleScheduleDelivery = (orderId: string) => {
    const deliveryDate = prompt('Enter preferred delivery date (e.g., Dec 18, 2024):');
    const deliveryTime = prompt('Enter preferred time slot:\n1. 9:00 AM - 12:00 PM\n2. 12:00 PM - 3:00 PM\n3. 3:00 PM - 6:00 PM\n\nEnter 1, 2, or 3:');
    
    if (deliveryDate && deliveryTime) {
      const timeSlots = {
        '1': '9:00 AM - 12:00 PM',
        '2': '12:00 PM - 3:00 PM',
        '3': '3:00 PM - 6:00 PM'
      };
      const selectedTime = timeSlots[deliveryTime as keyof typeof timeSlots] || deliveryTime;
      alert(`Delivery scheduled for Order ${orderId}:\nDate: ${deliveryDate}\nTime: ${selectedTime}\n\nYou will receive a confirmation SMS shortly.`);
    }
  };

  const handlePickupDetails = (orderId: string) => {
    alert(`Pickup Details for Order ${orderId}:\n\nLocation: Your registered address\nItems ready since: Dec 15, 2024\nPickup hours: 9:00 AM - 6:00 PM\n\nPlease bring your order confirmation or ID.`);
  };

  const [newPickup, setNewPickup] = useState({
    date: '',
    timeSlot: '',
    instructions: ''
  });

  const handleSchedulePickup = () => {
    if (!newPickup.date || !newPickup.timeSlot) {
      alert('Please select both date and time slot for pickup.');
      return;
    }
    
    alert(`Pickup scheduled successfully!\n\nDate: ${newPickup.date}\nTime: ${newPickup.timeSlot}\nInstructions: ${newPickup.instructions || 'None'}\n\nYou will receive a confirmation SMS shortly.`);
    setNewPickup({ date: '', timeSlot: '', instructions: '' });
  };

  const [pricingCalculator, setPricingCalculator] = useState({
    itemType: 'Dress Shirt',
    quantity: 1,
    expressService: false
  });

  const itemPrices = {
    'Dress Shirt': 10,
    'Suit': 25,
    'Pants': 8,
    'Dress': 20,
    'Coat': 30
  };

  const calculatePrice = () => {
    const basePrice = itemPrices[pricingCalculator.itemType as keyof typeof itemPrices] * pricingCalculator.quantity;
    const expressCharge = pricingCalculator.expressService ? basePrice * 0.5 : 0;
    return basePrice + expressCharge;
  };

  const handleAddToPickup = () => {
    const total = calculatePrice();
    alert(`Added to pickup:\n\n${pricingCalculator.quantity}x ${pricingCalculator.itemType}\nBase cost: ${formatCurrency(itemPrices[pricingCalculator.itemType as keyof typeof itemPrices] * pricingCalculator.quantity)}\n${pricingCalculator.expressService ? `Express service: ${formatCurrency(itemPrices[pricingCalculator.itemType as keyof typeof itemPrices] * pricingCalculator.quantity * 0.5)}\n` : ''}Total: ${formatCurrency(total)}\n\nItem added to your next pickup request.`);
  };

  const handleViewOrderDetails = (orderId: string) => {
    alert(`Order Details for ${orderId}:\n\nThis would open a detailed view with:\n• Complete item list\n• Service timeline\n• Payment information\n• Delivery tracking\n• Photos (if available)`);
  };

  // Message functionality for notifications
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Your cleaning service is scheduled for tomorrow at 10 AM',
      sender: 'system',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2', 
      text: 'Hi, I need to reschedule my appointment',
      sender: 'user',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageInput.trim(),
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Simulate a response after a short delay
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our team will get back to you shortly.',
          sender: 'system',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: {
      bookingConfirmations: true,
      serviceReminders: true,
      promotionalOffers: false
    },
    push: {
      realTimeUpdates: true,
      messages: true,
      marketing: false
    },
    quietHours: {
      start: '22:00',
      end: '08:00'
    }
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    selectedService: '',
    rating: 0,
    reviewText: ''
  });

  const handleSavePreferences = () => {
    // In a real app, this would save to the backend
    alert('Notification preferences saved successfully!');
    console.log('Saving preferences:', notificationPreferences);
  };

  const handleSubmitReview = () => {
    if (!reviewForm.selectedService || reviewForm.rating === 0 || !reviewForm.reviewText.trim()) {
      alert('Please fill in all fields before submitting your review.');
      return;
    }

    // In a real app, this would submit to the backend
    alert('Thank you for your review! It has been submitted successfully.');
    console.log('Submitting review:', reviewForm);
    
    // Reset form
    setReviewForm({
      selectedService: '',
      rating: 0,
      reviewText: ''
    });
  };

  const handleRatingClick = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleSaveProfileChanges = () => {
    // In a real app, this would update the user profile in the backend
    alert('Profile changes saved successfully!');
    console.log('Saving profile changes for user:', currentUser?.id);
  };
  
  // Fetch user bookings on component mount
  useEffect(() => {
    if (state.currentUser) {
      fetchUserBookings();
    }
  }, [state.currentUser, fetchUserBookings]);

  const currentUser = state.currentUser;
  const userBookings = state.bookings.filter(booking => booking.user_id === currentUser?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate user stats
  const totalBookings = userBookings.length;
  const activeOrders = userBookings.filter(b => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress').length;
  const totalSpent = userBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'book-service', label: 'Book a Service', icon: Plus },
    { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'dry-cleaning-tracker', label: 'Dry Cleaning Tracker', icon: Shirt },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile & Settings', icon: User },
    { id: 'support', label: 'Support Center', icon: HelpCircle },
    { id: 'reviews', label: 'Reviews & Feedback', icon: Star }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently in progress
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
              

            </div>

            {/* Quick Book Button - Prominent */}
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Need a cleaning service?</h3>
                    <p className="text-primary-foreground/80">Book your next cleaning in just a few clicks</p>
                  </div>
                  <button 
                    onClick={() => handleTabChange('new-booking')}
                    className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    Book a Cleaning
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Bookings & Service Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <button 
                    onClick={() => handleTabChange('bookings')}
                    className="text-sm text-primary hover:underline"
                  >
                    View All
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Show upcoming bookings */}
                    {userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Home className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.service}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(booking.date)}, {booking.time}</p>
                            <p className="text-xs text-blue-600 font-medium capitalize">{booking.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(booking.amount)}</p>
                          <p className="text-xs text-muted-foreground">2 hours</p>
                        </div>
                      </div>
                    ))}
                    
                    {userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No upcoming bookings</p>
                        <button 
                          onClick={() => handleTabChange('new-booking')}
                          className="text-primary hover:underline text-sm mt-2"
                        >
                          Book your first service
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Active service tracking */}
                    {userBookings.filter(b => b.status === 'in_progress').length > 0 ? (
                      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">Service In Progress</p>
                            <p className="text-sm text-muted-foreground">Team is working</p>
                          </div>
                        </div>
                        <div className="w-full bg-yellow-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-xs text-yellow-700 mt-2">Regular House Cleaning - Today</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active services</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Quick Actions</h4>
                      <button 
                        onClick={() => handleTabChange('new-booking')}
                        className="w-full flex items-center gap-3 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Book New Service
                      </button>
                      <button 
                        onClick={() => handleTabChange('pickup-delivery')}
                        className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        Track Dry Cleaning
                      </button>
                      <button 
                        onClick={() => handleTabChange('payments')}
                        className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Outstanding
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(booking.amount)}</p>
                        <p className={`text-sm capitalize ${getStatusColor(booking.status)}`}>{booking.status}</p>
                      </div>
                    </div>
                  ))}
                  
                  {userBookings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <button 
                onClick={() => setActiveTab('new-booking')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Booking
              </button>
            </div>

            <div className="grid gap-4">
              {userBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Home className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{booking.service}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {booking.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.address}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-lg font-bold mt-2">{formatCurrency(booking.amount)}</p>
                        <button className="text-primary hover:text-primary/80 text-sm mt-1">
                          <Eye className="w-4 h-4 inline mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'book-service':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Book a Service</h2>
            <BookingSystem />
          </div>
        );

      case 'my-bookings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <button 
                onClick={() => setActiveTab('book-service')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Booking
              </button>
            </div>

            {/* Booking Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{totalBookings}</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeOrders}</div>
                  <div className="text-sm text-muted-foreground">Active Orders</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{userBookings.filter(b => b.status === 'completed').length}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalSpent)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Filters */}
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">All</button>
              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">Upcoming</button>
              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">In Progress</button>
              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">Completed</button>
              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">Cancelled</button>
            </div>

            <div className="grid gap-4">
              {userBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Booking Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Home className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{booking.service}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {booking.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {booking.address}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-primary">{formatCurrency(booking.amount)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Reschedule
                              </button>
                              <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
                                <X className="w-4 h-4 inline mr-1" />
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'completed' && (
                            <>
                              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
                                <Eye className="w-4 h-4 inline mr-1" />
                                Download Invoice
                              </button>
                              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">
                                <Repeat className="w-4 h-4 inline mr-1" />
                                Book Again
                              </button>
                            </>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                              <Truck className="w-4 h-4 inline mr-1" />
                              Track Progress
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Tracking for Active Bookings */}
                      {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Service Progress</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Booking Confirmed</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Cleaner Assigned</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Service in Progress</span>
                              {booking.status === 'in_progress' ? (
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Service Completed</span>
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                            </div>
                          </div>
                          {booking.status === 'in_progress' && (
                            <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-600">
                              <p className="text-sm font-medium">Cleaner is currently at your location</p>
                              <p className="text-xs text-muted-foreground">Estimated completion: 2:30 PM</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Booking Details */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                         <div>
                           <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                           <p className="text-sm">{booking.service}</p>
                         </div>
                         <div>
                           <p className="text-sm font-medium text-muted-foreground">Amount</p>
                           <p className="text-sm">{formatCurrency(booking.amount)}</p>
                         </div>
                         <div>
                           <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                           <p className="text-sm capitalize">{booking.paymentStatus}</p>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {userBookings.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">Start by booking your first cleaning service</p>
                    <button 
                      onClick={() => setActiveTab('book-service')}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Book Now
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Payments & Billing</h2>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Payment Method
              </button>
            </div>

            {/* Billing Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(totalSpent)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{userBookings.filter(b => b.paymentStatus === 'paid').length}</div>
                  <div className="text-sm text-muted-foreground">Paid Invoices</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{userBookings.filter(b => b.paymentStatus === 'pending').length}</div>
                  <div className="text-sm text-muted-foreground">Pending Payments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSpent / 12)}</div>
                  <div className="text-sm text-muted-foreground">Avg Monthly</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Saved Payment Methods */}
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-8 rounded flex items-center justify-center ${
                            method.type === 'visa' ? 'bg-blue-600' : 'bg-red-600'
                          }`}>
                            <span className="text-white text-xs font-bold">
                              {method.type === 'visa' ? 'VISA' : 'MC'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• {method.last4}</p>
                            <p className="text-sm text-muted-foreground">Expires {method.expiryMonth}/{method.expiryYear}</p>
                          </div>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <button 
                              onClick={() => handleSetDefaultPayment(method.id)}
                              className="text-sm text-primary hover:underline"
                            >
                              Set Default
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditPayment(method.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleRemovePayment(method.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <PaymentIntegration />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Payment History
                </CardTitle>
                <div className="flex gap-2">
                  <select className="px-3 py-1 border rounded text-sm">
                    <option>All Time</option>
                    <option>This Year</option>
                    <option>Last 6 Months</option>
                    <option>Last 3 Months</option>
                  </select>
                  <button className="text-sm text-primary hover:underline">Download All</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          booking.paymentStatus === 'paid' ? 'bg-green-100' : 
                          booking.paymentStatus === 'pending' ? 'bg-orange-100' : 'bg-red-100'
                        }`}>
                          {booking.paymentStatus === 'paid' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : booking.paymentStatus === 'pending' ? (
                            <Clock className="w-5 h-5 text-orange-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(booking.date)} • {booking.time}</p>
                          <p className="text-xs text-muted-foreground">Invoice #{booking.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(booking.amount)}</p>
                        <p className={`text-sm capitalize ${
                          booking.paymentStatus === 'paid' ? 'text-green-600' : 
                          booking.paymentStatus === 'pending' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {booking.paymentStatus}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <button className="text-xs text-primary hover:underline">Download</button>
                          {booking.paymentStatus === 'pending' && (
                            <button className="text-xs text-primary hover:underline">Pay Now</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {userBookings.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                      <p className="text-muted-foreground">Your payment history will appear here once you make your first booking</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Promo Codes & Credits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Promo Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter promo code"
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                        Apply
                      </button>
                    </div>
                    
                    {/* Active Promo Codes */}
                    <div className="space-y-2">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800">FIRST20</p>
                            <p className="text-sm text-green-600">20% off first booking</p>
                          </div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Account Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(currentUser?.credits || 0)}</div>
                      <div className="text-sm text-muted-foreground">Available Credits</div>
                    </div>
                    
                    {currentUser?.credits && currentUser.credits > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Account balance</span>
                          <span className="text-green-600">{formatCurrency(currentUser.credits)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        No credits available
                      </div>
                    )}
                    
                    <button className="w-full mt-4 px-4 py-2 border rounded-lg text-sm hover:bg-muted transition-colors">
                      View Credit History
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'subscriptions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Subscriptions</h2>
            
            {/* Subscription Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Since</p>
                      <p className="font-semibold">Jan 15, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Billing</p>
                      <p className="font-semibold">Dec 23, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Saved</p>
                      <p className="font-semibold">{formatCurrency(480)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Repeat className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Services</p>
                      <p className="font-semibold">48 Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Current Plan */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Premium Weekly Cleaning</h3>
                      <p className="text-muted-foreground">Every Monday at 10:00 AM</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>• 3-4 hours service</span>
                        <span>• All rooms included</span>
                        <span>• Eco-friendly products</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(120)}</p>
                      <p className="text-sm text-muted-foreground">per week</p>
                      <p className="text-xs text-green-600 font-medium">20% savings vs one-time</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpgradePlan}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90"
                    >
                      Upgrade Plan
                    </button>
                    <button 
                      onClick={handleModifySchedule}
                      className="flex-1 border py-2 rounded-lg hover:bg-muted"
                    >
                      Modify Schedule
                    </button>
                    <button 
                      onClick={handlePauseSubscription}
                      className="flex-1 border py-2 rounded-lg hover:bg-muted"
                    >
                      Pause Subscription
                    </button>
                    <button 
                      onClick={handleCancelPlan}
                      className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50"
                    >
                      Cancel Plan
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <p className="text-sm text-muted-foreground">Compare and upgrade your subscription</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Basic Weekly</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">BASIC</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{formatCurrency(100)}</p>
                    <p className="text-sm text-muted-foreground mb-3">per week</p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• 2-3 hours service</li>
                      <li>• Main areas only</li>
                      <li>• Standard products</li>
                      <li>• 15% savings</li>
                    </ul>
                    <button 
                      onClick={handleDowngradeToBasic}
                      className="w-full border py-2 rounded-lg hover:bg-muted"
                    >
                      Downgrade
                    </button>
                  </div>
                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        CURRENT
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Premium Weekly</h3>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">POPULAR</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{formatCurrency(120)}</p>
                    <p className="text-sm text-muted-foreground mb-3">per week</p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• 3-4 hours service</li>
                      <li>• All rooms included</li>
                      <li>• Eco-friendly products</li>
                      <li>• 20% savings</li>
                    </ul>
                    <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg">
                      Current Plan
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Deluxe Weekly</h3>
                      <span className="text-xs bg-yellow-100 px-2 py-1 rounded">PREMIUM</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{formatCurrency(150)}</p>
                    <p className="text-sm text-muted-foreground mb-3">per week</p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• 4-5 hours service</li>
                      <li>• Deep cleaning included</li>
                      <li>• Premium products</li>
                      <li>• 25% savings</li>
                    </ul>
                    <button 
                      onClick={handleUpgradeToDeluxe}
                      className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription History */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Premium Weekly Plan</p>
                        <p className="text-sm text-muted-foreground">Dec 16, 2024 - Active</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(120)}</p>
                      <p className="text-sm text-muted-foreground">per week</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Repeat className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Basic Weekly Plan</p>
                        <p className="text-sm text-muted-foreground">Jan 15 - Dec 15, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(100)}</p>
                      <p className="text-sm text-muted-foreground">per week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Next Billing Cycle</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service Period:</span>
                        <span>Dec 23 - Dec 29, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">{formatCurrency(120)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>•••• 4242</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-renewal:</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Subscription Benefits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Priority booking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>20% discount on add-ons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Free rescheduling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Dedicated support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'dry-cleaning-tracker':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dry Cleaning & Laundry Tracker</h2>
            
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                      <p className="font-semibold">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ready for Pickup</p>
                      <p className="font-semibold">1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Out for Delivery</p>
                      <p className="font-semibold">2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="font-semibold">{formatCurrency(240)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Active Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order 1 - In Progress */}
                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shirt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Order #DC001</p>
                          <p className="text-sm text-muted-foreground">Picked up Dec 16, 2024</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Processing
                      </span>
                    </div>
                    
                    {/* Progress Tracker */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-3/5"></div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-center mt-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-blue-600 font-medium">Picked Up</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                          <span className="text-blue-600 font-medium">Processing</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div>
                          <span className="text-gray-400">Ready</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div>
                          <span className="text-gray-400">Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Items (5)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>2x Dress Shirts</span>
                          <span>{formatCurrency(20)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>1x Suit</span>
                          <span>{formatCurrency(25)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>2x Pants</span>
                          <span>{formatCurrency(15)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(60)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleTrackOrder('DC001')}
                        className="flex-1 border py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        Track Order
                      </button>
                      <button 
                        onClick={handleContactSupport}
                        className="flex-1 border py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        Contact Support
                      </button>
                    </div>
                  </div>

                  {/* Order 2 - Ready for Pickup */}
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Shirt className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Order #DC002</p>
                          <p className="text-sm text-muted-foreground">Ready since Dec 15, 2024</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Ready for Pickup
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>3x Shirts</span>
                        <span>{formatCurrency(30)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>1x Dress</span>
                        <span>{formatCurrency(20)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(50)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleScheduleDelivery('DC002')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                      >
                        Schedule Delivery
                      </button>
                      <button 
                        onClick={() => handlePickupDetails('DC002')}
                        className="flex-1 border py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        Pickup Details
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Pickup/Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule New Pickup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pickup Date</label>
                      <input 
                        type="date" 
                        value={newPickup.date}
                        onChange={(e) => setNewPickup(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-3 border rounded-lg" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Slot</label>
                      <select 
                        value={newPickup.timeSlot}
                        onChange={(e) => setNewPickup(prev => ({ ...prev, timeSlot: e.target.value }))}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select time slot</option>
                        <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
                        <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Special Instructions</label>
                      <textarea 
                        value={newPickup.instructions}
                        onChange={(e) => setNewPickup(prev => ({ ...prev, instructions: e.target.value }))}
                        className="w-full p-3 border rounded-lg" 
                        rows={3}
                        placeholder="Any special care instructions..."
                      ></textarea>
                    </div>
                    <button 
                      onClick={handleSchedulePickup}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90"
                    >
                      Schedule Pickup
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Item Type</label>
                        <select 
                          value={pricingCalculator.itemType}
                          onChange={(e) => setPricingCalculator(prev => ({ ...prev, itemType: e.target.value }))}
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="Dress Shirt">Dress Shirt</option>
                          <option value="Suit">Suit</option>
                          <option value="Pants">Pants</option>
                          <option value="Dress">Dress</option>
                          <option value="Coat">Coat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Quantity</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={pricingCalculator.quantity}
                          onChange={(e) => setPricingCalculator(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          className="w-full p-3 border rounded-lg" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">Estimated Cost</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>{pricingCalculator.quantity}x {pricingCalculator.itemType}</span>
                          <span>{formatCurrency(itemPrices[pricingCalculator.itemType as keyof typeof itemPrices] * pricingCalculator.quantity)}</span>
                        </div>
                        {pricingCalculator.expressService && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Express Service (+50%)</span>
                            <span>{formatCurrency(itemPrices[pricingCalculator.itemType as keyof typeof itemPrices] * pricingCalculator.quantity * 0.5)}</span>
                          </div>
                        )}
                        <div className="border-t pt-1 flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(calculatePrice())}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="express" 
                        checked={pricingCalculator.expressService}
                        onChange={(e) => setPricingCalculator(prev => ({ ...prev, expressService: e.target.checked }))}
                        className="rounded" 
                      />
                      <label htmlFor="express" className="text-sm">Express Service (24 hours)</label>
                    </div>
                    
                    <button 
                      onClick={handleAddToPickup}
                      className="w-full border py-3 rounded-lg hover:bg-muted"
                    >
                      Add to Pickup
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #DC003</p>
                        <p className="text-sm text-muted-foreground">Delivered Dec 10, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(45)}</p>
                      <button 
                        onClick={() => handleViewOrderDetails('DC003')}
                        className="text-sm text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #DC004</p>
                        <p className="text-sm text-muted-foreground">Delivered Dec 5, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(80)}</p>
                      <button 
                        onClick={() => handleViewOrderDetails('DC004')}
                        className="text-sm text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #DC005</p>
                        <p className="text-sm text-muted-foreground">Delivered Nov 28, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(65)}</p>
                      <button 
                        onClick={() => handleViewOrderDetails('DC005')}
                        className="text-sm text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notifications & Messages</h2>
              <div className="flex gap-2">
                <button className="text-sm text-primary hover:underline">Mark All Read</button>
                <button className="text-sm text-primary hover:underline">Clear All</button>
              </div>
            </div>
            
            {/* Notification Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Reminders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Promotions</p>
                </CardContent>
              </Card>
            </div>

            {/* Notification Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">All</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">Bookings</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">Messages</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">Reminders</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">Promotions</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">System</button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userBookings && userBookings.length > 0 ? (
                    userBookings.slice(0, 3).map((booking, index) => (
                      <div key={booking.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Booking {booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'pending' ? 'Pending' : 'Update'}</p>
                            {booking.status === 'confirmed' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Confirmed</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.service_type} service scheduled for {formatDate(booking.service_date)}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-muted-foreground">{formatDate(booking.created_at)}</p>
                            <button className="text-xs text-blue-600 hover:underline">View Details</button>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent notifications</p>
                      <p className="text-sm">Book a service to get started!</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center mt-4">
                  <button className="text-sm text-primary hover:underline">View All Notifications</button>
                </div>
              </CardContent>
            </Card>

            {/* Message Threads */}
            <Card>
              <CardHeader>
                <CardTitle>Message Threads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Sarah (Cleaner)</p>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      </div>
                      <p className="text-sm text-muted-foreground">I'll be arriving 10 minutes early today...</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">2</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Support Team</p>
                      <p className="text-sm text-muted-foreground">Thank you for contacting us. How can we help?</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Mike (Cleaner)</p>
                      <p className="text-sm text-muted-foreground">Service completed! Everything looks great.</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Support Chat
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full ml-auto">Online</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'system' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className={`p-2 rounded-lg max-w-xs sm:max-w-sm ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'opacity-75' : 'text-muted-foreground'
                          }`}>
                            {message.sender === 'user' ? 'You' : 'Support Team'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..." 
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                      Reschedule Booking
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                      Payment Issue
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                      Service Quality
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                      Technical Support
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Booking Confirmations</p>
                          <p className="text-sm text-muted-foreground">Get notified when bookings are confirmed</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.email.bookingConfirmations}
                          onChange={(e) => setNotificationPreferences(prev => ({
                            ...prev,
                            email: { ...prev.email, bookingConfirmations: e.target.checked }
                          }))}
                          className="w-4 h-4" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Service Reminders</p>
                          <p className="text-sm text-muted-foreground">Reminders before scheduled services</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.email.serviceReminders}
                          onChange={(e) => setNotificationPreferences(prev => ({
                            ...prev,
                            email: { ...prev.email, serviceReminders: e.target.checked }
                          }))}
                          className="w-4 h-4" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotional Offers</p>
                          <p className="text-sm text-muted-foreground">Special deals and discounts</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.email.promotionalOffers}
                          onChange={(e) => setNotificationPreferences(prev => ({
                            ...prev,
                            email: { ...prev.email, promotionalOffers: e.target.checked }
                          }))}
                          className="w-4 h-4" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Push Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Real-time Updates</p>
                          <p className="text-sm text-muted-foreground">Instant notifications for important updates</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.push.realTimeUpdates}
                          onChange={(e) => setNotificationPreferences(prev => ({
                            ...prev,
                            push: { ...prev.push, realTimeUpdates: e.target.checked }
                          }))}
                          className="w-4 h-4" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Messages</p>
                          <p className="text-sm text-muted-foreground">New messages from cleaners or support</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.push.messages}
                          onChange={(e) => setNotificationPreferences(prev => ({
                            ...prev,
                            push: { ...prev.push, messages: e.target.checked }
                          }))}
                          className="w-4 h-4" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing</p>
                          <p className="text-sm text-muted-foreground">Promotional content and offers</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.push.marketing}
                          onChange={(e) => setNotificationPreferences(prev => ({
                            ...prev,
                            push: { ...prev.push, marketing: e.target.checked }
                          }))}
                          className="w-4 h-4" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Quiet Hours</p>
                      <p className="text-sm text-muted-foreground">No notifications during these hours</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        value={notificationPreferences.quietHours.start}
                        onChange={(e) => setNotificationPreferences(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))}
                        className="px-2 py-1 border rounded text-sm" 
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <input 
                        type="time" 
                        value={notificationPreferences.quietHours.end}
                        onChange={(e) => setNotificationPreferences(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))}
                        className="px-2 py-1 border rounded text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSavePreferences}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Save Preferences
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Support & Help Center</h2>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Get instant help from our support team</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Submit Ticket</h3>
                  <p className="text-sm text-muted-foreground">Report an issue or ask a question</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Phone className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Call Support</h3>
                  <p className="text-sm text-muted-foreground">Speak directly with our team</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">How do I reschedule a booking?</h4>
                    <p className="text-sm text-muted-foreground">You can reschedule your booking up to 24 hours before the scheduled time through the My Bookings page.</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                    <p className="text-sm text-muted-foreground">We accept all major credit cards, debit cards, and digital wallets including Apple Pay and Google Pay.</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">How do I cancel my subscription?</h4>
                    <p className="text-sm text-muted-foreground">You can cancel your subscription anytime from the Subscriptions page. The cancellation will take effect after your current billing cycle.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reviews & Feedback</h2>
            
            {/* Leave a Review */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Your Recent Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Service</label>
                    <select 
                      value={reviewForm.selectedService}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, selectedService: e.target.value }))}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Choose a service to review</option>
                      <option value="regular-cleaning-dec10">Regular House Cleaning - Dec 10, 2024</option>
                      <option value="deep-cleaning-dec5">Deep Cleaning - Dec 5, 2024</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            star <= reviewForm.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                          onClick={() => handleRatingClick(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Review</label>
                    <textarea 
                      value={reviewForm.reviewText}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                      className="w-full p-3 border rounded-lg h-24"
                      placeholder="Tell us about your experience..."
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleSubmitReview}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
                  >
                    Submit Review
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Past Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Your Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Regular House Cleaning</h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Excellent service! The team was professional and thorough.</p>
                    <p className="text-xs text-muted-foreground">Reviewed on Dec 8, 2024</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Deep Cleaning</h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Good service overall, but took longer than expected.</p>
                    <p className="text-xs text-muted-foreground">Reviewed on Nov 28, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile & Settings</h2>
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Change Photo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()}
                      className="w-full p-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      value={currentUser?.email || ''}
                      className="w-full p-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input 
                      type="tel" 
                      value={currentUser?.phone || ''}
                      className="w-full p-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input 
                      type="date" 
                      className="w-full p-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSaveProfileChanges}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </CardContent>
            </Card>

            {/* Saved Addresses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Saved Addresses</CardTitle>
                <button 
                  onClick={handleAddAddress}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
                >
                  Add Address
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{address.label}</p>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditAddress(address.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferred Cleaner */}
            <Card>
              <CardHeader>
                <CardTitle>Preferred Cleaner</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.preferred_cleaner ? (
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{currentUser.preferred_cleaner}</p>
                      <p className="text-sm text-muted-foreground">Preferred cleaner</p>
                    </div>
                    <button className="text-sm text-primary hover:underline">Change</button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No preferred cleaner selected</p>
                    <button className="text-sm text-primary hover:underline mt-2">Select Cleaner</button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via text message</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates in the app</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Neatrix Dashboard</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-card border-r border-border min-h-screen relative">
          <div className="p-6">
            <h1 className="text-xl font-bold text-primary">Neatrix Dashboard</h1>
          </div>
          
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 bg-card h-full relative" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h1 className="text-xl font-bold text-primary">Neatrix Dashboard</h1>
              </div>
              
              <nav className="px-4 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;