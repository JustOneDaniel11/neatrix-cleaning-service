import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Calculator, CheckCircle, ArrowRight, Home, Building, Shirt, Zap, Waves, GraduationCap, HardHat, Sofa, Grid3X3 } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  basePrice: number;
  priceUnit: string;
  description: string;
  features: string[];
}

interface BookingData {
  service: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  area: number;
  rooms: number;
  frequency: string;
  addOns: string[];
  specialRequests: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
}

interface BookingSystemProps {
  onBookingSuccess?: () => void;
}

const BookingSystem: React.FC<BookingSystemProps> = ({ onBookingSuccess }) => {
  const { state, createBooking, fetchUserBookings } = useSupabaseData();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    service: '',
    serviceType: '',
    date: '',
    time: '',
    duration: 2,
    location: '',
    area: 0,
    rooms: 1,
    frequency: 'one-time',
    addOns: [],
    specialRequests: '',
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const services: Service[] = [
    {
      id: 'house',
      name: 'House Cleaning',
      icon: <Home className="w-6 h-6" />,
      basePrice: 8000,
      priceUnit: 'per room',
      description: 'Complete residential cleaning service',
      features: ['Deep cleaning', 'Kitchen & bathroom', 'Dusting & vacuuming', 'Eco-friendly products']
    },
    {
      id: 'office',
      name: 'Office Cleaning',
      icon: <Building className="w-6 h-6" />,
      basePrice: 15000,
      priceUnit: 'per 100sqm',
      description: 'Professional office cleaning',
      features: ['Workstation cleaning', 'Common areas', 'Restroom sanitization', 'Trash removal']
    },
    {
      id: 'post-construction',
      name: 'Post-Construction Cleaning',
      icon: <HardHat className="w-6 h-6" />,
      basePrice: 25000,
      priceUnit: 'per project',
      description: 'Specialized post-construction cleanup',
      features: ['Debris removal', 'Dust elimination', 'Window cleaning', 'Floor polishing']
    },
    {
      id: 'rug-tiles',
      name: 'Rug & Tiles Cleaning',
      icon: <Grid3X3 className="w-6 h-6" />,
      basePrice: 8000,
      priceUnit: 'per sqm',
      description: 'Deep cleaning for rugs and tile surfaces',
      features: ['Steam cleaning', 'Stain removal', 'Grout cleaning', 'Quick drying']
    },
    {
      id: 'couch',
      name: 'Couch Cleaning',
      icon: <Sofa className="w-6 h-6" />,
      basePrice: 12000,
      priceUnit: 'per piece',
      description: 'Professional upholstery cleaning',
      features: ['Fabric cleaning', 'Stain removal', 'Odor elimination', 'Fabric protection']
    },
    {
      id: 'laundry',
      name: 'Laundry Service',
      icon: <Waves className="w-6 h-6" />,
      basePrice: 500,
      priceUnit: 'per kg',
      description: 'Wash, dry, and fold service',
      features: ['Wash & dry', 'Folding', 'Fabric softener', 'Same-day service']
    },
    {
      id: 'dry-cleaning',
      name: 'Dry Cleaning',
      icon: <Shirt className="w-6 h-6" />,
      basePrice: 2000,
      priceUnit: 'per item',
      description: 'Professional dry cleaning',
      features: ['Stain removal', 'Pressing', 'Garment care', '48-hour turnaround']
    },
    {
      id: 'express',
      name: 'Express Service',
      icon: <Zap className="w-6 h-6" />,
      basePrice: 12000,
      priceUnit: 'base rate',
      description: 'Same-day cleaning service',
      features: ['Same-day service', 'Priority booking', 'Express delivery', '4-hour completion']
    },
    {
      id: 'school',
      name: 'School Cleaning',
      icon: <GraduationCap className="w-6 h-6" />,
      basePrice: 25000,
      priceUnit: 'per facility',
      description: 'Educational facility cleaning',
      features: ['Classroom cleaning', 'Sanitization', 'Floor maintenance', 'Child-safe products']
    }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const addOns = [
    { id: 'carpet', name: 'Carpet Cleaning', price: 5000 },
    { id: 'windows', name: 'Window Cleaning', price: 3000 },
    { id: 'appliances', name: 'Appliance Cleaning', price: 4000 },
    { id: 'deep-sanitization', name: 'Deep Sanitization', price: 6000 },
    { id: 'organizing', name: 'Organization Service', price: 8000 }
  ];

  const calculatePrice = () => {
    const selectedService = services.find(s => s.id === bookingData.service);
    if (!selectedService) return 0;

    let basePrice = selectedService.basePrice;
    
    // Calculate based on service type
    if (bookingData.service === 'house') {
      basePrice *= bookingData.rooms;
    } else if (bookingData.service === 'office') {
      basePrice *= Math.ceil(bookingData.area / 100);
    } else if (bookingData.service === 'laundry') {
      basePrice *= Math.max(1, bookingData.area); // area represents kg for laundry
    }

    // Frequency discounts
    const frequencyMultiplier = {
      'one-time': 1,
      'weekly': 0.85,
      'bi-weekly': 0.9,
      'monthly': 0.95
    };
    basePrice *= frequencyMultiplier[bookingData.frequency as keyof typeof frequencyMultiplier];

    // Add-ons
    const addOnPrice = bookingData.addOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    return Math.round(basePrice + addOnPrice);
  };

  useEffect(() => {
    setTotalPrice(calculatePrice());
  }, [bookingData]);

  const handleServiceSelect = (serviceId: string) => {
    setBookingData(prev => ({ ...prev, service: serviceId }));
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!state.currentUser) {
      alert('Please log in to create a booking.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected service details
      const selectedService = services.find(s => s.id === bookingData.service);
      
      // Create booking data for database
      const newBookingData = {
        user_id: state.currentUser.id,
        service_type: bookingData.service,
        service_name: selectedService?.name || bookingData.service,
        date: bookingData.date,
        time: bookingData.time,
        address: bookingData.customerInfo.address || bookingData.location,
        phone: bookingData.customerInfo.phone,
        special_instructions: bookingData.specialRequests,
        status: 'pending' as const,
        total_amount: totalPrice
      };

      await createBooking(newBookingData);
      
      // Refresh bookings list and wait for completion
      await fetchUserBookings();

      // Reset form
      setBookingData({
        service: '',
        serviceType: '',
        date: '',
        time: '',
        duration: 2,
        location: '',
        area: 0,
        rooms: 1,
        frequency: 'one-time',
        addOns: [],
        specialRequests: '',
        customerInfo: {
          name: '',
          phone: '',
          email: '',
          address: ''
        }
      });
      
      setCurrentStep(1);
      
      // Call the callback to refresh parent component first
      if (onBookingSuccess) {
        onBookingSuccess();
      }
      
      // Show success message after navigation
      setTimeout(() => {
        alert('Booking created successfully! You can view it in your My Bookings section.');
      }, 100);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }

    setIsSubmitting(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderServiceSelection = () => (
    <div className="space-y-4 md:space-y-6">
      <h3 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-4 md:mb-6">Select Your Service</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            className="p-3 sm:p-4 md:p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-300 touch-manipulation"
          >
            <div className="flex items-center mb-3 md:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mr-2 sm:mr-3 md:mr-4 flex-shrink-0">
                {service.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{service.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600">₦{service.basePrice.toLocaleString()} {service.priceUnit}</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">{service.description}</p>
            <ul className="text-xs text-gray-500 space-y-1">
              {service.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServiceDetails = () => {
    const selectedService = services.find(s => s.id === bookingData.service);
    
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Service Details</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-2">
            {selectedService?.icon}
            <h4 className="font-semibold text-gray-800 ml-2">{selectedService?.name}</h4>
          </div>
          <p className="text-sm text-gray-600">{selectedService?.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {bookingData.service === 'house' ? 'Number of Rooms' : 
               bookingData.service === 'office' ? 'Area (sqm)' :
               bookingData.service === 'laundry' ? 'Weight (kg)' : 'Quantity'}
            </label>
            <input
              type="number"
              min="1"
              value={bookingData.service === 'house' ? bookingData.rooms : bookingData.area}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                if (bookingData.service === 'house') {
                  setBookingData(prev => ({ ...prev, rooms: value }));
                } else {
                  setBookingData(prev => ({ ...prev, area: value }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Service Frequency</label>
            <select
              value={bookingData.frequency}
              onChange={(e) => setBookingData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
            >
              <option value="one-time">One-time Service</option>
              <option value="weekly">Weekly (15% discount)</option>
              <option value="bi-weekly">Bi-weekly (10% discount)</option>
              <option value="monthly">Monthly (5% discount)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Add-on Services</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addOns.map((addOn) => (
              <label key={addOn.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200 min-h-[56px]">
                <input
                  type="checkbox"
                  checked={bookingData.addOns.includes(addOn.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBookingData(prev => ({ ...prev, addOns: [...prev.addOns, addOn.id] }));
                    } else {
                      setBookingData(prev => ({ ...prev, addOns: prev.addOns.filter(id => id !== addOn.id) }));
                    }
                  }}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{addOn.name}</span>
                  <span className="text-sm text-gray-600 ml-2">+₦{addOn.price.toLocaleString()}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Estimated Total:</span>
            <span className="text-2xl font-bold text-green-600">₦{totalPrice.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Final price may vary based on actual requirements</p>
        </div>
      </div>
    );
  };

  const renderScheduling = () => (
    <div className="space-y-6">
      <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">Schedule Your Service</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Preferred Date
          </label>
          <input
            type="date"
            value={bookingData.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Preferred Time
          </label>
          <select
            value={bookingData.time}
            onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
          >
            <option value="">Select time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <MapPin className="w-4 h-4 inline mr-2" />
          Service Location
        </label>
        <select
          value={bookingData.location}
          onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
        >
          <option value="">Select location</option>
          <option value="lagos-island">Lagos Island</option>
          <option value="victoria-island">Victoria Island</option>
          <option value="ikoyi">Ikoyi</option>
          <option value="lekki">Lekki</option>
          <option value="ajah">Ajah</option>
          <option value="surulere">Surulere</option>
          <option value="ikeja">Ikeja</option>
          <option value="yaba">Yaba</option>
          <option value="gbagada">Gbagada</option>
          <option value="maryland">Maryland</option>
        </select>
      </div>
    </div>
  );

  const renderCustomerInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">Contact Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={bookingData.customerInfo.name}
            onChange={(e) => setBookingData(prev => ({
              ...prev,
              customerInfo: { ...prev.customerInfo, name: e.target.value }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            value={bookingData.customerInfo.phone}
            onChange={(e) => setBookingData(prev => ({
              ...prev,
              customerInfo: { ...prev.customerInfo, phone: e.target.value }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
            placeholder="+234 xxx xxx xxxx"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Mail className="w-4 h-4 inline mr-2" />
          Email Address
        </label>
        <input
          type="email"
          value={bookingData.customerInfo.email}
          onChange={(e) => setBookingData(prev => ({
            ...prev,
            customerInfo: { ...prev.customerInfo, email: e.target.value }
          }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Complete Address
        </label>
        <textarea
          value={bookingData.customerInfo.address}
          onChange={(e) => setBookingData(prev => ({
            ...prev,
            customerInfo: { ...prev.customerInfo, address: e.target.value }
          }))}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your complete address including landmarks"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          value={bookingData.specialRequests}
          onChange={(e) => setBookingData(prev => ({
            ...prev,
            specialRequests: e.target.value
          }))}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special instructions, allergies, or specific requirements..."
        />
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-4">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Service:</span>
            <span className="font-medium">{services.find(s => s.id === bookingData.service)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span className="font-medium">{bookingData.date} at {bookingData.time}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-medium">{bookingData.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          <div className="flex justify-between">
            <span>Frequency:</span>
            <span className="font-medium">{bookingData.frequency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-green-600">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="booking" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Book Your Service</h2>
          <p className="text-xl text-gray-600">Get instant quotes and schedule your cleaning service in minutes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStepIndicator()}

          {currentStep === 1 && renderServiceSelection()}
          {currentStep === 2 && renderServiceDetails()}
          {currentStep === 3 && renderScheduling()}
          {currentStep === 4 && renderCustomerInfo()}

          {currentStep > 1 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 2 && (!bookingData.service || !bookingData.frequency)) ||
                    (currentStep === 3 && (!bookingData.date || !bookingData.time || !bookingData.location))
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!bookingData.customerInfo.name || !bookingData.customerInfo.phone || !bookingData.customerInfo.email}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSystem;