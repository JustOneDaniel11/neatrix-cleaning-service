import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Home, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  AlertCircle,
  Edit3,
  Save,
  X,
  DollarSign,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PropertyInspectionBooking {
  id: string;
  user_id?: string;
  service_name?: string;
  service_type?: string;
  date?: string;
  time?: string;
  phone?: string;
  address?: string;
  special_instructions?: string;
  status: string;
  total_amount?: number;
  created_at: string;
  updated_at?: string;
  users?: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
  };
}

interface PropertyInspectionDetailsProps {
  booking: PropertyInspectionBooking | null;
  onBookingUpdate?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PropertyInspectionDetails: React.FC<PropertyInspectionDetailsProps> = ({
  booking,
  onBookingUpdate,
  showToast
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No booking selected</p>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Parse property details from special_instructions
  const parsePropertyDetails = (instructions: string) => {
    try {
      return JSON.parse(instructions);
    } catch {
      return {};
    }
  };

  const propertyDetails = parsePropertyDetails(booking.special_instructions || '{}');

  // Price edit functions
  const startPriceEdit = () => {
    setIsEditingPrice(true);
    setTempPrice((booking.total_amount || 0).toString());
  };

  const cancelPriceEdit = () => {
    setIsEditingPrice(false);
    setTempPrice('');
  };

  const savePriceEdit = async () => {
    console.log('🔧 DEBUG: savePriceEdit called', { 
      bookingId: booking.id, 
      tempPrice, 
      isSavingPrice,
      isEditingPrice 
    });
    
    if (!booking.id) {
      console.log('❌ DEBUG: No booking ID found');
      if (showToast) {
        showToast('Error: No booking ID found', 'error');
      }
      return;
    }
    
    const priceValue = parseFloat(tempPrice);
    if (!tempPrice || isNaN(priceValue) || priceValue <= 0) {
      console.log('❌ DEBUG: Invalid price', { tempPrice });
      if (showToast) {
        showToast('Please enter a valid price greater than 0', 'error');
      }
      return;
    }
    
    console.log('✅ DEBUG: Starting price update', { bookingId: booking.id, newPrice: priceValue });
    setIsSavingPrice(true);
    try {
      // Only update if this is NOT a laundry/dry cleaning order (regular booking)
      const { error } = await supabase
        .from('bookings')
        .update({ 
          total_amount: priceValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id)
        .not('service_type', 'in', '(laundry,dry_cleaning)');

      if (error) throw error;

      console.log('✅ DEBUG: Price updated successfully');
      if (showToast) {
        showToast('Price updated successfully', 'success');
      }
      
      setIsEditingPrice(false);
      setTempPrice('');
      
      // Trigger refresh if callback provided
      if (onBookingUpdate) {
        console.log('🔄 DEBUG: Triggering booking update callback');
        onBookingUpdate();
      }
    } catch (error) {
      console.error('❌ DEBUG: Error updating price:', error);
      if (showToast) {
        showToast(`Failed to update price: ${error.message}`, 'error');
      }
    } finally {
      setIsSavingPrice(false);
    }
  };

  const updateBookingStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      showToast?.(`Booking ${newStatus} successfully`, 'success');
      onBookingUpdate?.();
    } catch (error) {
      console.error('Error updating booking status:', error);
      showToast?.('Failed to update booking status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      showToast?.('Booking deleted successfully', 'success');
      onBookingUpdate?.();
    } catch (error) {
      console.error('Error deleting booking:', error);
      showToast?.('Failed to delete booking', 'error');
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Header with Status and Actions */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Property Inspection Booking
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Booking ID: #{booking.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Admin Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => updateBookingStatus('approved')}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => updateBookingStatus('rejected')}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
          
          {booking.status === 'approved' && (
            <button
              onClick={() => updateBookingStatus('completed')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Completed
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Booking Details */}
      <div className="p-6 space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 mr-2" />
            Customer Information
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {booking.users?.full_name || propertyDetails.contactName || 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {booking.users?.email || propertyDetails.contactEmail || 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {booking.phone || propertyDetails.contactPhone || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="space-y-4">
          <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <Home className="w-4 h-4 mr-2" />
            Property Information
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Property Type</label>
              <span className="text-sm text-gray-900 dark:text-white">
                {propertyDetails.propertyType || 'N/A'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Service Type</label>
              <span className="text-sm text-gray-900 dark:text-white">
                {booking.service_name || 'Property Inspection'}
              </span>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Address / Location</label>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {booking.address || 'N/A'}
                </span>
              </div>
            </div>

            {propertyDetails.totalSquareFootage && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Total Square Footage</label>
                <span className="text-sm text-gray-900 dark:text-white">
                  {propertyDetails.totalSquareFootage} sq ft
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        {(propertyDetails.kitchens || propertyDetails.bathrooms || propertyDetails.bedrooms) && (
          <div className="space-y-4">
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Home className="w-4 h-4 mr-2" />
              Room Details
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {propertyDetails.kitchens && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Kitchens</label>
                  <span className="text-sm text-gray-900 dark:text-white">{propertyDetails.kitchens}</span>
                </div>
              )}
              {propertyDetails.bathrooms && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bathrooms</label>
                  <span className="text-sm text-gray-900 dark:text-white">{propertyDetails.bathrooms}</span>
                </div>
              )}
              {propertyDetails.bedrooms && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bedrooms</label>
                  <span className="text-sm text-gray-900 dark:text-white">{propertyDetails.bedrooms}</span>
                </div>
              )}
              {propertyDetails.livingRooms && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Living Rooms</label>
                  <span className="text-sm text-gray-900 dark:text-white">{propertyDetails.livingRooms}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inspection Schedule */}
        <div className="space-y-4">
          <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Inspection Schedule
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Preferred Date</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {booking.date ? formatDate(booking.date) : propertyDetails.preferredDate || 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Preferred Time</label>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {booking.time || propertyDetails.preferredTime || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(propertyDetails.specialRequests || propertyDetails.accessInstructions || booking.total_amount) && (
          <div className="space-y-4">
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4 mr-2" />
              Additional Information
            </div>
            
            {propertyDetails.specialRequests && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Special Requests</label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {propertyDetails.specialRequests}
                </p>
              </div>
            )}
            
            {propertyDetails.accessInstructions && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Access Instructions</label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {propertyDetails.accessInstructions}
                </p>
              </div>
            )}

            {booking.total_amount && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Price</label>
                {isEditingPrice ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={isSavingPrice}
                      />
                    </div>
                    <button
                      onClick={() => {
                        console.log('🖱️ DEBUG: Save button clicked');
                        savePriceEdit();
                      }}
                      disabled={isSavingPrice}
                      className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                    >
                      {isSavingPrice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={cancelPriceEdit}
                      disabled={isSavingPrice}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(booking.total_amount)}
                    </span>
                    <button
                      onClick={startPriceEdit}
                      className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      title="Edit price"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {propertyDetails.urgency && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Urgency Level</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  propertyDetails.urgency === 'urgent' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : propertyDetails.urgency === 'high'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {propertyDetails.urgency}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Booking Created:</span>
            <span>{formatDateTime(booking.created_at)}</span>
          </div>
          {booking.updated_at && (
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Last Updated:</span>
              <span>{formatDateTime(booking.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Delete
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteBooking}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInspectionDetails;