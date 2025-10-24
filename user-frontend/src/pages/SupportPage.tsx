import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import type { SupportMessage } from '../contexts/SupabaseDataContext';
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
  const { state, createSupportMessage, createSupportTicket } = useSupabaseData();
  const { currentUser, supportMessages } = state;
  const [ticketId, setTicketId] = useState<string | null>(null);
  // Prefer ticket-specific subscription when available; fallback to sender_id
  const { data: realtimeMessages } = useRealtimeData<SupportMessage>('support_messages', '*',
    ticketId ? { column: 'ticket_id', value: ticketId } : (currentUser ? { column: 'sender_id', value: currentUser.id } : undefined)
  );

  const [activeTab, setActiveTab] = useState<'chat' | 'reviews' | 'faq' | 'contact'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // ticketId declared earlier for realtime filter
  const [contactForm, setContactForm] = useState<{ subject: string; message: string }>({ subject: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Use realtime messages if available, otherwise fall back to context
  const currentMessagesAll: SupportMessage[] = (realtimeMessages || supportMessages || []) as SupportMessage[];
  const currentMessages = ticketId ? currentMessagesAll.filter(m => m.ticket_id === ticketId) : currentMessagesAll;

  // Mock reviews data for now since reviews aren't in the main context yet
  const reviews: Review[] = [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    const ensureTicket = async () => {
      if (!currentUser || ticketId) return;
      try {
        const ticket = await createSupportTicket({
          user_id: currentUser.id,
          subject: 'General Support',
          description: 'User initiated chat in Support Center',
          status: 'open',
          priority: 'normal',
          category: 'general'
        });
        setTicketId(ticket.id);
      } catch (err) {
        console.error('Failed to create support ticket:', err);
      }
    };
    ensureTicket();
  }, [currentUser, ticketId, createSupportTicket]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || isLoading) return;

    setIsLoading(true);
    try {
      let activeTicketId = ticketId;
      if (!activeTicketId) {
        const ticket = await createSupportTicket({
          user_id: currentUser.id,
          subject: 'General Support',
          description: 'User initiated chat in Support Center',
          status: 'open',
          priority: 'normal',
          category: 'general'
        });
        activeTicketId = ticket.id;
        setTicketId(activeTicketId);
      }
      console.log('User sending message:', {
        ticket_id: activeTicketId,
        sender_id: currentUser.id,
        sender_type: 'user',
        message: newMessage.trim(),
        message_type: 'text',
        is_read: false
      });
      
      const result = await createSupportMessage({
        ticket_id: activeTicketId!,
        sender_id: currentUser.id,
        sender_type: 'user',
        message: newMessage.trim(),
        message_type: 'text',
        is_read: false
      });
      
      console.log('Message sent successfully:', result);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get sender name
  const getSenderName = (message: any) => {
    if (message.sender_type === 'admin') {
      return 'Support Agent';
    } else {
      return currentUser?.full_name || currentUser?.email || 'You';
    }
  };

  const handleSubmitContact = async () => {
    if (!currentUser || !contactForm.subject.trim() || !contactForm.message.trim() || isSubmittingContact) return;

    setIsSubmittingContact(true);
    try {
      let activeTicketId = ticketId;
      if (!activeTicketId) {
        const ticket = await createSupportTicket({
          user_id: currentUser.id,
          subject: contactForm.subject.trim(),
          description: 'Contact inquiry from Support Center',
          status: 'open',
          priority: 'normal',
          category: 'general'
        });
        activeTicketId = ticket.id;
        setTicketId(activeTicketId);
      }

      await createSupportMessage({
        ticket_id: activeTicketId!,
        sender_id: currentUser.id,
        sender_type: 'user',
        message: `Subject: ${contactForm.subject.trim()}\n\nMessage: ${contactForm.message.trim()}`,
        message_type: 'text',
        is_read: false
      });

      setContactForm({ subject: '', message: '' });
      alert('Your message has been sent successfully! We will get back to you soon.');
    } catch (error) {
      console.error('Error sending contact message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
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
    <div className="min-h-screen bg-background text-foreground dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Support Center</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Get help, leave reviews, and contact our team</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {([
              { id: 'chat', label: 'Live Chat', icon: MessageCircle },
              { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
              { id: 'faq', label: 'FAQ', icon: AlertCircle },
              { id: 'contact', label: 'Contact Info', icon: Phone }
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600'
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Live Support Chat</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">We typically respond within a few minutes</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-200" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start a conversation</h3>
                  <p className="text-gray-500 dark:text-gray-300">Send us a message and we'll get back to you shortly.</p>
                </div>
              ) : (
                currentMessages.map((message) => {
                  const isUser = message.sender_type === 'user';
                  return (
                    <div key={message.id} className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
                      <div className={`text-xs mb-1 ${isUser ? 'text-right text-gray-600 dark:text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        {getSenderName(message)}
                      </div>
                      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end`}>
                        {!isUser && (
                          <div className="mr-2 flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-white">S</div>
                          </div>
                        )}
                        <div className={`relative px-4 py-2 rounded-2xl shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                          <p className="text-sm leading-relaxed break-words">{message.message}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-[10px] ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-300'}`}>{formatDate(message.created_at)}</span>
                            {isUser && (
                              <span className="text-[10px] text-blue-100">✓</span>
                            )}
                          </div>
                        </div>
                        {isUser && (
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">You</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {averageRating.toFixed(1)}
                    </div>
                    <div>
                      {renderStars(Math.round(averageRating), 'lg')}
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Based on {reviews?.length || 0} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-8">
                        {rating}★
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-300 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <select
                  value={reviewFilter}
                  onChange={(e) =>
                    setReviewFilter(
                      e.target.value as 'all' | '1' | '2' | '3' | '4' | '5'
                    )
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Star className="h-12 w-12 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews found</h3>
                  <p className="text-gray-500 dark:text-gray-300">
                    {searchQuery || reviewFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Be the first to leave a review after your service!'}
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {review.rating}/5
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {review.service_type} • {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.question}</h3>
                    <Plus className="h-5 w-5 text-gray-400 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Phone</h4>
                    <p className="text-gray-600 dark:text-gray-300">+234 903 484 2430</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Sat: 8 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
                    <p className="text-gray-600 dark:text-gray-300">contactneatrix@gmail.com</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Address</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      123 Clean Street<br />
                      Laundry District, LD 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
                    placeholder="Describe your inquiry..."
                  />
                </div>
                <button
                  onClick={handleSubmitContact}
                  disabled={!contactForm.subject.trim() || !contactForm.message.trim() || isSubmittingContact}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px]"
                >
                  {isSubmittingContact ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;