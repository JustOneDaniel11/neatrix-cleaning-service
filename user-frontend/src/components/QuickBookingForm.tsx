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
    notes: ''
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
        total_amount: getServicePrice(formData.service)
      };

      await createBooking(bookingData);

      // Reset form
      setFormData({
        service: '',
        date: '',
        time: '',
        address: '',
        notes: ''
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service</label>
            <select
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background"
              required
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background"
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
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your address"
              className="w-full p-3 border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special instructions or requirements"
              className="w-full p-3 border border-border rounded-lg bg-background"
              rows={3}
            />
          </div>

          {formData.service && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Price:</p>
              <p className="text-lg font-bold text-primary">
                ₦{getServicePrice(formData.service).toLocaleString()}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickBookingForm;