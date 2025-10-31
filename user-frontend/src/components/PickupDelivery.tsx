import React, { useState } from 'react';
import { Truck, Package, Clock, MapPin, Phone, CheckCircle, AlertCircle, Calendar, User, Search } from 'lucide-react';

interface PickupOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  serviceType: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  status: 'scheduled' | 'picked-up' | 'in-progress' | 'ready' | 'out-for-delivery' | 'delivered';
  items: string[];
  specialInstructions: string;
  estimatedPrice: number;
}

const PickupDelivery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'track'>('schedule');
  const [trackingId, setTrackingId] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: '',
    pickupDate: '',
    pickupTime: '',
    deliveryDate: '',
    deliveryTime: '',
    items: '',
    specialInstructions: '',
    urgency: 'standard'
  });

  // Sample orders for demonstration
  const sampleOrders: PickupOrder[] = [
    {
      id: 'NTX001',
      customerName: 'Adebayo Johnson',
      phone: '+234 803 123 4567',
      address: '15 Admiralty Way, Lekki Phase 1, Lagos',
      serviceType: 'Dry Cleaning',
      pickupDate: '2024-01-15',
      pickupTime: '10:00',
      deliveryDate: '2024-01-17',
      deliveryTime: '14:00',
      status: 'in-progress',
      items: ['3 Suits', '2 Dresses', '1 Coat'],
      specialInstructions: 'Handle with care - delicate fabrics',
      estimatedPrice: 15000
    },
    {
      id: 'NTX002',
      customerName: 'Fatima Abdullahi',
      phone: '+234 701 987 6543',
      address: '42 Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
      serviceType: 'Laundry Service',
      pickupDate: '2024-01-16',
      pickupTime: '09:00',
      deliveryDate: '2024-01-16',
      deliveryTime: '18:00',
      status: 'ready',
      items: ['Bedsheets', 'Towels', 'Casual wear'],
      specialInstructions: 'Same day service requested',
      estimatedPrice: 8500
    }
  ];

  const serviceTypes = [
    { id: 'laundry', name: 'Laundry Service', description: 'Wash, dry, and fold', turnaround: 'Same day' },
    { id: 'dry-cleaning', name: 'Dry Cleaning', description: 'Professional dry cleaning', turnaround: '2-3 days' },
    { id: 'ironing', name: 'Ironing Service', description: 'Professional pressing', turnaround: 'Same day' },
    { id: 'express', name: 'Express Service', description: 'Rush service available', turnaround: '4 hours' },
    { id: 'post-construction', name: 'Post-Construction Cleaning', description: 'Specialized post-construction cleanup', turnaround: '1-2 days' },
    { id: 'rug-tiles', name: 'Rug & Tiles Cleaning', description: 'Deep cleaning for rugs and tile surfaces', turnaround: 'Same day' },
    { id: 'couch', name: 'Couch Cleaning', description: 'Professional upholstery cleaning', turnaround: 'Same day' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'picked-up': return <Package className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'out-for-delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Pickup/Delivery scheduled:', formData);
    alert('Pickup and delivery scheduled successfully! You will receive a confirmation SMS shortly.');
    
    // Reset form
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      address: '',
      serviceType: '',
      pickupDate: '',
      pickupTime: '',
      deliveryDate: '',
      deliveryTime: '',
      items: '',
      specialInstructions: '',
      urgency: 'standard'
    });
  };

  const handleTrackOrder = () => {
    const order = sampleOrders.find(o => o.id === trackingId.toUpperCase());
    if (order) {
      // Show order details
      console.log('Order found:', order);
    } else {
      alert('Order not found. Please check your tracking ID.');
    }
  };

  const renderScheduleForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Schedule Pickup & Delivery</h3>
        <p className="text-gray-600">We'll pick up your items and deliver them back to you clean and fresh</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Customer Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickup-customer-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="pickup-customer-name"
                name="customerName"
                autoComplete="name"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="pickup-phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                id="pickup-phone"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+234 xxx xxx xxxx"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="pickup-email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="pickup-email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="pickup-address" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Pickup/Delivery Address
            </label>
            <textarea
              id="pickup-address"
              name="address"
              autoComplete="street-address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter complete address with landmarks"
              required
            />
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Service Type</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {serviceTypes.map((service) => (
              <label key={service.id} htmlFor={`service-${service.id}`} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                <input
                  type="radio"
                  id={`service-${service.id}`}
                  name="serviceType"
                  value={service.id}
                  checked={formData.serviceType === service.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="mt-1 mr-3"
                  required
                />
                <div>
                  <div className="font-medium text-gray-800">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.description}</div>
                  <div className="text-xs text-blue-600 mt-1">Turnaround: {service.turnaround}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pickup Schedule */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Pickup Schedule
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
              <input
                type="date"
                id="pickup-date"
                name="pickupDate"
                value={formData.pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
              <select
                id="pickup-time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Delivery Schedule
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="delivery-date" className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
              <input
                type="date"
                id="delivery-date"
                name="deliveryDate"
                value={formData.deliveryDate}
                min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="delivery-time" className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
              <select
                id="delivery-time"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Additional Information</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="pickup-items" className="block text-sm font-medium text-gray-700 mb-2">Items Description</label>
              <textarea
                id="pickup-items"
                name="items"
                value={formData.items}
                onChange={(e) => setFormData(prev => ({ ...prev, items: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the items (e.g., 3 shirts, 2 dresses, 1 suit)"
                required
              />
            </div>
            <div>
              <label htmlFor="pickup-instructions" className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
              <textarea
                id="pickup-instructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special care instructions or notes"
              />
            </div>
            <div>
              <label htmlFor="pickup-urgency" className="block text-sm font-medium text-gray-700 mb-2">Service Urgency</label>
              <select
                id="pickup-urgency"
                name="urgency"
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="standard">Standard Service</option>
                <option value="express">Express Service (+50% fee)</option>
                <option value="same-day">Same Day Service (+100% fee)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold text-lg"
        >
          Schedule Pickup & Delivery
        </button>
      </form>
    </div>
  );

  const renderOrderTracking = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Track Your Order</h3>
        <p className="text-gray-600">Enter your tracking ID to see the current status of your order</p>
      </div>

      {/* Tracking Input */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              id="tracking-id"
              name="trackingId"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID (e.g., NTX001)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] touch-manipulation"
            />
          </div>
          <button
            onClick={handleTrackOrder}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-300 flex items-center justify-center font-medium text-base min-h-[44px] touch-manipulation whitespace-nowrap sm:flex-shrink-0"
          >
            <Search className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>Track</span>
          </button>
        </div>
      </div>

      {/* Sample Orders Display */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 mb-4">Recent Orders</h4>
        {sampleOrders.map((order) => (
          <div key={order.id} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h5 className="font-semibold text-gray-800 text-base">Order #{order.id}</h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">{order.customerName}</p>
                <p className="text-sm text-gray-500">{order.serviceType}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold text-gray-800 text-base">₦{order.estimatedPrice.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{order.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Pickup</p>
                <p className="text-sm text-gray-600">{order.pickupDate} at {order.pickupTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Delivery</p>
                <p className="text-sm text-gray-600">{order.deliveryDate} at {order.deliveryTime}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Items</p>
              <p className="text-sm text-gray-600 break-words">{order.items.join(', ')}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
              <p className="text-sm text-gray-600 break-words">{order.address}</p>
            </div>

            {order.specialInstructions && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Special Instructions</p>
                <p className="text-sm text-gray-600 break-words">{order.specialInstructions}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Order Progress</p>
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {['scheduled', 'picked-up', 'in-progress', 'ready', 'delivered'].map((status, index) => (
                  <div key={status} className="flex flex-col items-center min-w-0 flex-shrink-0 px-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs ${
                      ['scheduled', 'picked-up', 'in-progress', 'ready'].indexOf(order.status) >= index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getStatusIcon(status)}
                    </div>
                    <span className="text-xs text-gray-600 mt-1 text-center max-w-[60px] break-words leading-tight">
                      {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="pickup-delivery" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Pickup & Delivery Service</h2>
          <p className="text-xl text-gray-600">Convenient door-to-door service with real-time tracking</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-300 ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Schedule Service
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-300 ${
                activeTab === 'track'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Track Order
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'schedule' ? renderScheduleForm() : renderOrderTracking()}
        </div>
      </div>
    </section>
  );
};

export default PickupDelivery;