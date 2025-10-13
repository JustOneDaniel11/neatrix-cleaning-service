import { useState } from "react";
import { 
  Home, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  Minus,
  FileText,
  Send,
  Phone,
  MessageSquare
} from "lucide-react";
import { useSupabaseData } from "../../contexts/SupabaseDataContext";

const BookInspectionPage = () => {
  const { state, createBooking } = useSupabaseData();
  const [formData, setFormData] = useState({
    propertyType: '',
    address: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    preferredDate: '',
    preferredTime: '',
    alternateDate: '',
    alternateTime: '',
    kitchens: 1,
    bathrooms: 1,
    bedrooms: 1,
    livingRooms: 1,
    diningRooms: 0,
    offices: 0,
    basements: 0,
    garages: 0,
    totalSquareFootage: '',
    specialRequests: '',
    accessInstructions: '',
    urgency: 'standard'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condominium' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'office', label: 'Office Space' },
    { value: 'commercial', label: 'Commercial Property' },
    { value: 'other', label: 'Other' }
  ];

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];

  const urgencyOptions = [
    { value: 'standard', label: 'Standard (3-5 business days)', color: 'text-green-600' },
    { value: 'priority', label: 'Priority (1-2 business days)', color: 'text-yellow-600' },
    { value: 'urgent', label: 'Urgent (Same day/Next day)', color: 'text-red-600' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoomCountChange = (room: string, increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      [room]: Math.max(0, prev[room as keyof typeof prev] as number + (increment ? 1 : -1))
    }));
  };

  const validateForm = () => {
    const required = ['propertyType', 'address', 'contactName', 'contactPhone', 'contactEmail', 'preferredDate', 'preferredTime'];
    return required.every(field => formData[field as keyof typeof formData]);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!state.currentUser) {
      alert('You must be logged in to book an inspection');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate estimated price based on property details
      const basePrice = 150; // Base inspection price
      const roomCount = formData.kitchens + formData.bathrooms + formData.bedrooms + 
                       formData.livingRooms + formData.diningRooms + formData.offices + 
                       formData.basements + formData.garages;
      const roomMultiplier = Math.max(1, roomCount * 0.1);
      const urgencyMultiplier = formData.urgency === 'urgent' ? 1.5 : 
                               formData.urgency === 'priority' ? 1.25 : 1;
      const estimatedPrice = Math.round(basePrice * roomMultiplier * urgencyMultiplier);

      // Prepare special instructions with property details
      const propertyDetails = `Property Type: ${formData.propertyType}
Rooms: ${formData.kitchens} kitchen(s), ${formData.bathrooms} bathroom(s), ${formData.bedrooms} bedroom(s), ${formData.livingRooms} living room(s), ${formData.diningRooms} dining room(s), ${formData.offices} office(s), ${formData.basements} basement(s), ${formData.garages} garage(s)
${formData.totalSquareFootage ? `Total Square Footage: ${formData.totalSquareFootage}` : ''}
Contact: ${formData.contactName} (${formData.contactPhone}, ${formData.contactEmail})
Urgency: ${formData.urgency}
${formData.alternateDate ? `Alternate Date: ${formData.alternateDate} at ${formData.alternateTime}` : ''}
${formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : ''}
${formData.accessInstructions ? `Access Instructions: ${formData.accessInstructions}` : ''}`;

      // Create booking
      const bookingData = {
        user_id: state.currentUser?.id || '',
        service_type: 'inspection',
        service_name: 'Property Inspection',
        date: formData.preferredDate,
        service_date: formData.preferredDate,
        time: formData.preferredTime,
        address: formData.address,
        phone: formData.contactPhone,
        special_instructions: propertyDetails,
        status: 'pending' as const,
        total_amount: estimatedPrice
      };

      await createBooking(bookingData);
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          propertyType: '',
          address: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          preferredDate: '',
          preferredTime: '',
          alternateDate: '',
          alternateTime: '',
          kitchens: 1,
          bathrooms: 1,
          bedrooms: 1,
          livingRooms: 1,
          diningRooms: 0,
          offices: 0,
          basements: 0,
          garages: 0,
          totalSquareFootage: '',
          specialRequests: '',
          accessInstructions: '',
          urgency: 'standard'
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting inspection request:', error);
      alert('Failed to submit inspection request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Property Inspection</h1>
          <p className="text-gray-600">Schedule a professional inspection for your property</p>
        </div>

        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspection Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your inspection request has been sent to our admin team for review. 
            You'll receive a confirmation email shortly with next steps.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Call Us
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Live Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Book Property Inspection</h1>
        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Schedule a comprehensive property inspection with our certified team</p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3" />
            <p className="text-xs sm:text-sm text-green-800">
              Your inspection request has been submitted successfully! We'll contact you within 24 hours to confirm your appointment.
            </p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Property Information */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Property Information
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Property Type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-500 min-h-[44px]"
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Square Footage */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Total Square Footage
                </label>
                <input
                  type="number"
                  value={formData.totalSquareFootage}
                  onChange={(e) => handleInputChange('totalSquareFootage', e.target.value)}
                  placeholder="e.g., 1200"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-500 min-h-[44px]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Property Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  placeholder="Enter the complete property address"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none text-gray-900 placeholder-gray-500 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Room Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Bedrooms */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bedrooms
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('bedrooms', false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {formData.bedrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('bedrooms', true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bathrooms
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('bathrooms', false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {formData.bathrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('bathrooms', true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Living Rooms */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Living Rooms
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('livingRooms', false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {formData.livingRooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('livingRooms', true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Kitchens */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kitchens
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('kitchens', false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {formData.kitchens}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('kitchens', true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Dining Rooms */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dining Rooms
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('diningRooms', false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {formData.diningRooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('diningRooms', true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Offices */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offices
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('offices', false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {formData.offices}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoomCountChange('offices', true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-900" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Preferred Schedule
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Preferred Date/Time */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Preferred Date & Time *</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
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
              </div>

              {/* Alternate Date/Time */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Alternate Date & Time (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.alternateDate}
                      onChange={(e) => handleInputChange('alternateDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      value={formData.alternateTime}
                      onChange={(e) => handleInputChange('alternateTime', e.target.value)}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] text-gray-900 placeholder-gray-500"
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
              </div>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Urgency Level</h3>
            <div className="space-y-2 sm:space-y-3">
              {urgencyOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-50 touch-manipulation min-h-[44px]">
                  <input
                    type="radio"
                    name="urgency"
                    value={option.value}
                    checked={formData.urgency === option.value}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <span className={`font-medium text-sm sm:text-base ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Additional Information
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Areas of Concern
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                  placeholder="Any specific areas you'd like us to focus on, concerns, or special requirements..."
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none text-gray-900 placeholder-gray-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Access Instructions
                </label>
                <textarea
                  value={formData.accessInstructions}
                  onChange={(e) => handleInputChange('accessInstructions', e.target.value)}
                  rows={2}
                  placeholder="How should our team access the property? (key location, gate codes, contact person, etc.)"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none text-gray-900 placeholder-gray-500 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateForm()}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base touch-manipulation min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Submit Inspection Request
                </>
              )}
            </button>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
              Your request will be sent directly to our admin team for review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookInspectionPage;