import React, { useState } from 'react';
import { X, Star, Send, CheckCircle } from 'lucide-react';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import type { Booking } from '../../contexts/SupabaseDataContext';

interface DeliveryReviewPromptProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

const DeliveryReviewPrompt: React.FC<DeliveryReviewPromptProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const { createReview } = useSupabaseData();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await createReview({
        booking_id: booking.id,
        rating,
        comment: comment.trim() || 'No additional comments',
        service_type: booking.service_name || booking.service_type
      });
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setRating(0);
    setComment('');
    setSubmitted(false);
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-600">
            Your review has been submitted successfully. We appreciate your feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                🎉 Delivery Completed!
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                How was your experience?
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Order ID:</span> {booking.id.slice(0, 8)}</p>
              <p><span className="font-medium">Service:</span> {booking.service_name}</p>
              <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate your experience *
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">
                {rating > 0 ? `${rating}/5 stars` : 'Click to rate'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us about your experience with the delivery service..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReviewPrompt;