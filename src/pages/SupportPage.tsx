import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { 
  MessageCircle, 
  Send, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MoreVertical
} from 'lucide-react';

interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
  service_type: string;
  user_name?: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  last_updated: string;
}

const SupportPage: React.FC = () => {
  const { state, createSupportMessage } = useSupabaseData();
  const { currentUser, supportMessages } = state;
  const { data: realtimeMessages } = useRealtimeData('support_messages', '*', 
    currentUser ? { column: 'sender_id', value: currentUser.id } : undefined
  );

  const [activeTab, setActiveTab] = useState<'chat' | 'reviews' | 'faq' | 'contact'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use realtime messages if available, otherwise fall back to context
  const currentMessages = realtimeMessages || supportMessages || [];

  // Mock reviews data for now since reviews aren't in the main context yet
  const reviews: Review[] = [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || isLoading) return;

    setIsLoading(true);
    try {
      await createSupportMessage({
        ticket_id: 'general', // For now, use a general ticket ID
        sender_id: currentUser.id,
        sender_type: 'user',
        message: newMessage.trim(),
        message_type: 'text',
        is_read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredReviews = reviews?.filter(review => {
    const matchesSearch = searchQuery === '' || 
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.service_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = reviewFilter === 'all' || review.rating.toString() === reviewFilter;
    
    return matchesSearch && matchesFilter;
  }) || [];

  const averageRating = reviews?.length ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews?.filter(r => r.rating === rating).length || 0,
    percentage: reviews?.length ? 
      ((reviews.filter(r => r.rating === rating).length / reviews.length) * 100) : 0
  }));

  const faqItems = [
    {
      question: "How do I schedule a pickup?",
      answer: "You can schedule a pickup through your dashboard by clicking 'Book Service' and selecting your preferred date and time."
    },
    {
      question: "What are your operating hours?",
      answer: "We operate Monday through Saturday from 8 AM to 6 PM. Sunday pickups are available by special request."
    },
    {
      question: "How long does dry cleaning take?",
      answer: "Standard dry cleaning takes 24-48 hours. Express service (same-day) is available for an additional fee."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payments through our secure payment system."
    },
    {
      question: "Do you offer pickup and delivery?",
      answer: "Yes! We offer free pickup and delivery within our service area. Additional charges may apply for locations outside our standard zone."
    }
  ];

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="mt-2 text-gray-600">Get help, leave reviews, and contact our team</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'chat', label: 'Live Chat', icon: MessageCircle },
              { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
              { id: 'faq', label: 'FAQ', icon: AlertCircle },
              { id: 'contact', label: 'Contact Info', icon: Phone }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Live Support Chat</h3>
                  <p className="text-sm text-gray-500">We typically respond within a few minutes</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500">Send us a message and we'll get back to you shortly.</p>
                </div>
              ) : (
                currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender_type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Overview */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </div>
                    <div>
                      {renderStars(Math.round(averageRating), 'lg')}
                      <p className="text-sm text-gray-500 mt-1">
                        Based on {reviews?.length || 0} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {rating}★
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-500">
                    {searchQuery || reviewFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Be the first to leave a review after your service!'}
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-gray-900">
                              {review.rating}/5
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {review.service_type} • {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer">
                    <h3 className="font-medium text-gray-900">{item.question}</h3>
                    <Plus className="h-5 w-5 text-gray-400 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Sat: 8 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">contactneatrix@gmail.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Address</h4>
                    <p className="text-gray-600">
                      123 Clean Street<br />
                      Laundry District, LD 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Hours</h3>
              <div className="space-y-3">
                {[
                  { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Friday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
                  { day: 'Sunday', hours: 'Closed' }
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-900">{day}</span>
                    <span className={`text-sm ${hours === 'Closed' ? 'text-red-500' : 'text-gray-600'}`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;