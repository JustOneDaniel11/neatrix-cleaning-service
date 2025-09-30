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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Property Inspection</h1>
        <p className="text-gray-600">Schedule a professional inspection for your property</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Property Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Property Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Square Footage (Optional)
                </label>
                <input
                  type="number"
                  value={formData.totalSquareFootage}
                  onChange={(e) => handleInputChange('totalSquareFootage', e.target.value)}
                  placeholder="e.g., 1200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                placeholder="Enter full address including unit number, city, state, and zip code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Room Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Room Details</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'kitchens', label: 'Kitchens', min: 1 },
                { key: 'bathrooms', label: 'Bathrooms', min: 1 },
                { key: 'bedrooms', label: 'Bedrooms', min: 1 },
                { key: 'livingRooms', label: 'Living Rooms', min: 1 },
                { key: 'diningRooms', label: 'Dining Rooms', min: 0 },
                { key: 'offices', label: 'Offices', min: 0 },
                { key: 'basements', label: 'Basements', min: 0 },
                { key: 'garages', label: 'Garages', min: 0 }
              ].map((room) => (
                <div key={room.key} className="border border-gray-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {room.label}
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleRoomCountChange(room.key, false)}
                      disabled={(formData[room.key as keyof typeof formData] as number) <= room.min}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {formData[room.key as keyof typeof formData]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRoomCountChange(room.key, true)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Preferred Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Date/Time */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Preferred Date & Time *</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <h4 className="font-medium text-gray-900 mb-3">Alternate Date & Time (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.alternateDate}
                      onChange={(e) => handleInputChange('alternateDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      value={formData.alternateTime}
                      onChange={(e) => handleInputChange('alternateTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Urgency Level</h3>
            <div className="space-y-2">
              {urgencyOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={option.value}
                    checked={formData.urgency === option.value}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Additional Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Areas of Concern
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                  placeholder="Any specific areas you'd like us to focus on, concerns, or special requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Instructions
                </label>
                <textarea
                  value={formData.accessInstructions}
                  onChange={(e) => handleInputChange('accessInstructions', e.target.value)}
                  rows={2}
                  placeholder="How should our team access the property? (key location, gate codes, contact person, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateForm()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Inspection Request
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Your request will be sent directly to our admin team for review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookInspectionPage;