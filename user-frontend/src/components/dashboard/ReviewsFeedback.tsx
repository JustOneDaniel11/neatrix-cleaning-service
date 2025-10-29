import { useState } from "react";
import { 
  Star, 
  Send, 
  Calendar,
  CheckCircle,
  MessageSquare,
  User,
  ThumbsUp,
  Filter,
  Search
} from "lucide-react";

interface Review {
  id: string;
  serviceType: 'dry-cleaning' | 'inspection' | 'regular-cleaning';
  rating: number;
  title: string;
  comment: string;
  date: string;
  serviceDate: string;
  orderNumber: string;
  response?: {
    message: string;
    date: string;
    responder: string;
  };
}

const ReviewsFeedback = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [newReview, setNewReview] = useState({
    serviceType: '',
    orderNumber: '',
    rating: 0,
    title: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filterService, setFilterService] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Past reviews - will be loaded from real data
  const [pastReviews] = useState<Review[]>([]);

  const serviceTypes = [
    { value: 'dry-cleaning', label: 'Dry Cleaning' },
    { value: 'inspection', label: 'Property Inspection' },
    { value: 'regular-cleaning', label: 'Regular Cleaning' }
  ];

  const handleRatingClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const validateForm = () => {
    return newReview.serviceType && 
           newReview.orderNumber && 
           newReview.rating > 0 && 
           newReview.title.trim() && 
           newReview.comment.trim();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would submit to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setNewReview({
          serviceType: '',
          orderNumber: '',
          rating: 0,
          title: '',
          comment: ''
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const service = serviceTypes.find(s => s.value === type);
    return service ? service.label : type;
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'dry-cleaning': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-green-100 text-green-800';
      case 'regular-cleaning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReviews = pastReviews.filter(review => {
    const matchesService = filterService === 'all' || review.serviceType === filterService;
    const matchesSearch = searchTerm === '' || 
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesService && matchesSearch;
  });

  const renderStars = (rating: number, interactive: boolean = false, size: string = 'w-5 h-5') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={interactive ? () => handleRatingClick(star) : undefined}
            disabled={!interactive}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviews & Feedback</h1>
          <p className="text-gray-600">Share your experience and help us improve our services</p>
        </div>

        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your feedback! Your review helps us improve our services and assists other customers.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setActiveTab('history')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Reviews
            </button>
            <button 
              onClick={() => {
                setSubmitSuccess(false);
                setActiveTab('new');
              }}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Write Another Review
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviews & Feedback</h1>
        <p className="text-gray-600">Share your experience and help us improve our services</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'new', label: 'Write Review', icon: MessageSquare },
              { id: 'history', label: `My Reviews (${pastReviews.length})`, icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Write New Review Tab */}
          {activeTab === 'new' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Write a New Review</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type *
                    </label>
                    <select
                      value={newReview.serviceType}
                      onChange={(e) => setNewReview(prev => ({ ...prev, serviceType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select service type</option>
                      {serviceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number *
                    </label>
                    <input
                      type="text"
                      value={newReview.orderNumber}
                      onChange={(e) => setNewReview(prev => ({ ...prev, orderNumber: e.target.value }))}
                      placeholder="e.g., DC-2024-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Overall Rating *
                  </label>
                  <div className="flex items-center space-x-4">
                    {renderStars(newReview.rating, true, 'w-8 h-8')}
                    <span className="text-sm text-gray-600">
                      {newReview.rating > 0 ? `${newReview.rating} out of 5 stars` : 'Click to rate'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience in a few words"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={5}
                    placeholder="Tell us about your experience. What went well? What could be improved?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {newReview.comment.length}/500 characters
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateForm()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting Review...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Review History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search reviews..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="sm:w-48">
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Services</option>
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterService !== 'all' ? 'No reviews found' : 'No reviews yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterService !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Your reviews will appear here after you submit them'
                    }
                  </p>
                  {!searchTerm && filterService === 'all' && (
                    <button
                      onClick={() => setActiveTab('new')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Write Your First Review
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {review.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getServiceTypeColor(review.serviceType)}`}>
                              {getServiceTypeLabel(review.serviceType)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                              <span className="ml-1">{review.rating}/5</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Reviewed on {new Date(review.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Order: {review.orderNumber}</p>
                          <p>Service: {new Date(review.serviceDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      {review.response && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-blue-900">Response from {review.response.responder}</span>
                                <span className="text-sm text-blue-600">
                                  {new Date(review.response.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-blue-800">{review.response.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful</span>
                          </button>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Edit Review
                        </button>
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

export default ReviewsFeedback;