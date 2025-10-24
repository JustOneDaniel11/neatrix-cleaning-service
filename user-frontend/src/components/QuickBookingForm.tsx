import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";
import { convertTo24Hour } from "@/lib/timeUtils";

const QuickBookingForm = () => {
  const { state, createBooking } = useSupabaseData();
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    address: '',
    notes: '',
    deliveryPreference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    'House Cleaning',
    'Office Cleaning',
    'Deep Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
    'Post-Construction Cleaning'
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentUser) return;

    setIsSubmitting(true);

    try {
      // Create new booking using Supabase
      const bookingData = {
        user_id: state.currentUser.id,
        service_type: 'cleaning',
        service_name: formData.service,
        date: formData.date,
        time: convertTo24Hour(formData.time), // Convert to 24-hour format for database
        address: formData.address,
        phone: state.currentUser.phone || '',
        special_instructions: formData.notes,
        status: 'pending' as const,
        total_amount: getServicePrice(formData.service),
         pickup_option: (formData.deliveryPreference === 'delivery' ? 'delivery' : 'pickup') as 'delivery' | 'pickup'
        };

      await createBooking(bookingData);

      // Reset form
      setFormData({
        service: '',
        date: '',
        time: '',
        address: '',
        notes: '',
        deliveryPreference: ''
      });

      alert('Booking created successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }

    setIsSubmitting(false);
    alert('Booking created successfully! Check the admin dashboard to see real-time updates.');
  };

  const getServiceId = (serviceName: string): string => {
    const serviceMap: { [key: string]: string } = {
      'House Cleaning': '1',
      'Office Cleaning': '2',
      'Deep Cleaning': '3',
      'Carpet Cleaning': '4',
      'Window Cleaning': '5',
      'Post-Construction Cleaning': '6',
      'Rug & Tiles Cleaning': '7',
      'Couch Cleaning': '8'
    };
    return serviceMap[serviceName] || '1';
  };

  const getServicePrice = (service: string): number => {
    const prices: { [key: string]: number } = {
      'House Cleaning': 25000,
      'Office Cleaning': 35000,
      'Deep Cleaning': 45000,
      'Carpet Cleaning': 20000,
      'Window Cleaning': 15000,
      'Post-Construction Cleaning': 55000,
      'Rug & Tiles Cleaning': 8000,
      'Couch Cleaning': 12000
    };
    return prices[service] || 25000;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-3">Service</label>
            <select
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px]"
              required
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px]"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px]"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your address"
              className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">How would you like to receive your laundry?</label>
            <select
              value={formData.deliveryPreference}
              onChange={(e) => handleInputChange('deliveryPreference', e.target.value)}
              className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px]"
              required
            >
              <option value="">Select preference</option>
              <option value="pickup">I will pick it up myself</option>
              <option value="delivery">Deliver it to my location</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special instructions or requirements"
              className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
              rows={4}
            />
          </div>

          {formData.service && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Estimated Price:</p>
              <p className="text-xl font-bold text-primary">
                ₦{getServicePrice(formData.service).toLocaleString()}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-4 px-6 text-base font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickBookingForm;