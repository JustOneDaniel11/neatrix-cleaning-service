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
  Search,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

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
  const { isDarkMode } = useDarkMode();
  const { createReview, state } = useSupabaseData();
  
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Character limits
  const TITLE_LIMIT = 100;
  const COMMENT_LIMIT = 500;

  // Past reviews - using state from context
  const pastReviews = state.reviews || [];

  const serviceTypes = [
    { value: 'dry-cleaning', label: 'Dry Cleaning' },
    { value: 'inspection', label: 'Property Inspection' },
    { value: 'regular-cleaning', label: 'Regular Cleaning' }
  ];

  const handleRatingClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
    setSubmitError(null); // Clear error when user interacts
  };

  const validateForm = () => {
    if (!newReview.serviceType) return { isValid: false, error: 'Please select a service type' };
    if (!newReview.orderNumber.trim()) return { isValid: false, error: 'Please enter an order number' };
    if (newReview.rating === 0) return { isValid: false, error: 'Please provide a rating' };
    if (!newReview.title.trim()) return { isValid: false, error: 'Please enter a review title' };
    if (newReview.title.length > TITLE_LIMIT) return { isValid: false, error: `Title must be ${TITLE_LIMIT} characters or less` };
    if (!newReview.comment.trim()) return { isValid: false, error: 'Please write your review' };
    if (newReview.comment.length > COMMENT_LIMIT) return { isValid: false, error: `Review must be ${COMMENT_LIMIT} characters or less` };
    
    return { isValid: true, error: null };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitError(validation.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create review using the existing API
      await createReview({
        service_type: newReview.serviceType as 'dry-cleaning' | 'inspection' | 'regular-cleaning',
        order_number: newReview.orderNumber.trim(),
        rating: newReview.rating,
        title: newReview.title.trim(),
        comment: newReview.comment.trim(),
        user_id: state.authUser?.id || ''
      });
      
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
      setSubmitError('Failed to submit review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewReview(prev => ({ ...prev, [field]: value }));
    setSubmitError(null); // Clear error when user types
  };

  const getServiceTypeLabel = (type: string) => {
    const service = serviceTypes.find(s => s.value === type);
    return service ? service.label : type;
  };

  const getServiceTypeColor = (type: string) => {
    if (isDarkMode) {
      switch (type) {
        case 'dry-cleaning': return 'bg-blue-900/30 text-blue-300 border border-blue-700';
        case 'inspection': return 'bg-green-900/30 text-green-300 border border-green-700';
        case 'regular-cleaning': return 'bg-purple-900/30 text-purple-300 border border-purple-700';
        default: return 'bg-gray-800/30 text-gray-300 border border-gray-600';
      }
    } else {
      switch (type) {
        case 'dry-cleaning': return 'bg-blue-100 text-blue-800';
        case 'inspection': return 'bg-green-100 text-green-800';
        case 'regular-cleaning': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
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
                : isDarkMode ? 'text-gray-600' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer transition-colors' : 'cursor-default'}`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  // Dynamic input classes for dark mode
  const inputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-600 text-gray-100 focus:bg-gray-700 focus:border-blue-400 [&::placeholder]:text-gray-400 [&::placeholder]:opacity-100' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
  }`;

  const selectClasses = "w-full rounded-lg border border-gray-300 p-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400 dark:shadow-[0_0_5px_rgba(255,255,255,0.05)] focus:ring-2 focus:ring-blue-500 focus:outline-none dark:focus:ring-blue-400";

  const textareaClasses = "w-full rounded-lg border border-gray-300 p-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400 dark:shadow-[0_0_5px_rgba(255,255,255,0.05)] focus:ring-2 focus:ring-blue-500 focus:outline-none dark:focus:ring-blue-400 resize-none";

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <div className={`rounded-lg p-6 border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h1 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Reviews & Feedback</h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Share your experience and help us improve our services
          </p>
        </div>

        <div className={`rounded-lg p-8 border text-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Review Submitted!</h2>
          <p className={`mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
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
              className={`border px-6 py-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
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
      <div className={`rounded-lg p-6 border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h1 className={`text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Reviews & Feedback</h1>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Share your experience and help us improve our services
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className={`rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'new', label: 'Write Review', icon: MessageSquare },
              { id: 'history', label: `My Reviews (${pastReviews.length})`, icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : isDarkMode 
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
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
                <h3 className={`text-lg font-medium mb-4 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>Write a New Review</h3>
                
                {/* Error Message */}
                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                      <p className="text-red-700 dark:text-red-400 text-sm">{submitError}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Service Type *
                    </label>
                    <select
                      value={newReview.serviceType}
                      onChange={(e) => handleInputChange('serviceType', e.target.value)}
                      className={selectClasses}
                    >
                      <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                        Select service type
                      </option>
                      {serviceTypes.map((type) => (
                        <option 
                          key={type.value} 
                          value={type.value}
                          className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Order Number *
                    </label>
                    <input
                      type="text"
                      value={newReview.orderNumber}
                      onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                      placeholder="e.g., DC-2024-001"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Overall Rating *
                  </label>
                  <div className="flex items-center space-x-4">
                    {renderStars(newReview.rating, true, 'w-8 h-8')}
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {newReview.rating > 0 ? `${newReview.rating} out of 5 stars` : 'Click to rate'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Review Title * ({newReview.title.length}/{TITLE_LIMIT})
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Summarize your experience in a few words"
                    maxLength={TITLE_LIMIT}
                    className={inputClasses}
                  />
                  {newReview.title.length > TITLE_LIMIT * 0.9 && (
                    <p className={`text-xs mt-1 ${
                      newReview.title.length >= TITLE_LIMIT ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {TITLE_LIMIT - newReview.title.length} characters remaining
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your Review * ({newReview.comment.length}/{COMMENT_LIMIT})
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    rows={5}
                    placeholder="Write your review…"
                    maxLength={COMMENT_LIMIT}
                    className={textareaClasses}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {newReview.comment.length}/{COMMENT_LIMIT} characters
                    </p>
                    {newReview.comment.length > COMMENT_LIMIT * 0.9 && (
                      <p className={`text-xs ${
                        newReview.comment.length >= COMMENT_LIMIT ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {COMMENT_LIMIT - newReview.comment.length} characters remaining
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateForm().isValid}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search reviews..."
                      className={`pl-10 pr-3 py-2 ${inputClasses.replace('px-3', '')}`}
                    />
                  </div>
                </div>
                
                <div className="sm:w-48">
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="all" className={isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>
                      All Services
                    </option>
                    {serviceTypes.map((type) => (
                      <option 
                        key={type.value} 
                        value={type.value}
                        className={isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className={`w-16 h-16 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-lg font-medium mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {searchTerm || filterService !== 'all' ? 'No reviews found' : 'No reviews yet'}
                  </h3>
                  <p className={`mb-6 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
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
                    <div key={review.id} className={`border rounded-lg p-6 ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-800/50' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-lg font-semibold ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {review.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getServiceTypeColor(review.serviceType)}`}>
                              {getServiceTypeLabel(review.serviceType)}
                            </span>
                          </div>
                          <div className={`flex items-center space-x-4 text-sm mb-3 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
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
                        <div className={`text-right text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <p>Order: {review.orderNumber}</p>
                          <p>Service: {new Date(review.serviceDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <p className={`mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{review.comment}</p>

                      {review.response && (
                        <div className={`border rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-blue-900/20 border-blue-800' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode 
                                ? 'bg-blue-800/50' 
                                : 'bg-blue-100'
                            }`}>
                              <User className={`w-4 h-4 ${
                                isDarkMode ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`font-medium ${
                                  isDarkMode ? 'text-blue-300' : 'text-blue-900'
                                }`}>Response from {review.response.responder}</span>
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                }`}>
                                  {new Date(review.response.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className={isDarkMode ? 'text-blue-200' : 'text-blue-800'}>
                                {review.response.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={`flex items-center justify-between mt-4 pt-4 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className={`flex items-center space-x-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <button className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful</span>
                          </button>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
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