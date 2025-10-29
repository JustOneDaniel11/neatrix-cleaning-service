import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { useRealtimeData } from '../../hooks/useRealtimeData';
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
  MoreVertical,
  Headphones
} from "lucide-react";
import ServiceStatusBanner from "../ServiceStatusBanner";
import { isSupabaseConfigured } from "@/lib/supabase";

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

const SupportPage: React.FC = () => {
  const { state, createSupportMessage, createSupportTicket, getOrCreateSupportTicket, fetchSupportTickets, fetchSupportMessages, fetchReviews, createReview, deleteDefaultAdminMessagesForUser } = useSupabaseData();
  const { currentUser, supportMessages, error } = state as any;
  const [ticketId, setTicketId] = useState<string | null>(null);
  // Prefer ticket-specific subscription when available; fallback to sender_id
  const { data: realtimeMessages } = useRealtimeData('support_messages', '*', 
    ticketId ? { column: 'ticket_id', value: ticketId } : (currentUser ? { column: 'sender_id', value: currentUser.id } : undefined)
  );

  const [activeTab, setActiveTab] = useState<'chat' | 'reviews' | 'faq' | 'contact'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    service_type: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use realtime messages if available, otherwise fall back to context
  const allMessages = realtimeMessages || supportMessages || [];
  const currentMessages = ticketId
    ? (allMessages || []).filter((m: any) => m.ticket_id === ticketId)
    : [];

  // Use reviews from context
  const reviews: Review[] = (state as any).reviews || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Preload tickets/messages/reviews without auto-creating tickets
  useEffect(() => {
    const preload = async () => {
      if (!currentUser) return;
      try {
        await Promise.all([
          fetchSupportTickets(currentUser.id),
          fetchSupportMessages(),
          fetchReviews()
        ]);
      } catch (err) {
        console.error('Failed to preload support data:', err);
      }
    };
    preload();
  }, [currentUser]);

  const startNewChat = async () => {
    if (!currentUser || isLoading) return null;
    setIsLoading(true);
    try {
      const created = await createSupportTicket({
        user_id: currentUser.id,
        subject: 'General Support',
        description: 'User started a new chat',
        status: 'open',
        priority: 'normal',
        category: 'general'
      });
      setTicketId(created.id);
      await fetchSupportMessages(created.id);
      return created.id;
    } catch (e) {
      console.error('Failed to start new chat:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || isLoading) return;

    setIsLoading(true);
    try {
      // Fallback: if ticket not yet created, create it now
      let activeTicketId = ticketId;
      if (!activeTicketId) {
        activeTicketId = await startNewChat();
        if (!activeTicketId) throw new Error('Unable to create chat ticket');
      }
      
      // Check if this is the user's first message in this ticket
      const existingMessages = supportMessages.filter(
        msg => msg.ticket_id === activeTicketId && msg.sender_type === 'user'
      );
      const isFirstMessage = existingMessages.length === 0;
      
      // Create support message for the chat
      await createSupportMessage({
        ticket_id: activeTicketId!,
        sender_id: currentUser.id,
        sender_type: 'user',
        message: newMessage.trim(),
        message_type: 'text',
        is_read: false
      });

      // If this is the first message, send automatic welcome message
      if (isFirstMessage) {
        // Small delay to ensure user message is processed first
        setTimeout(async () => {
          try {
            await createSupportMessage({
              ticket_id: activeTicketId!,
              sender_id: 'system', // Use 'system' as sender_id for automated messages
              sender_type: 'admin',
              message: "Hello! 👋 Thanks for reaching out. Please drop your message and one of our customer service representatives will get back to you soon.",
              message_type: 'text',
              is_read: false
            });
          } catch (error) {
            console.error('Error sending welcome message:', error);
          }
        }, 500);
      }
      
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

  const handleSubmitReview = async () => {
    if (!currentUser || !newReview.rating || !newReview.comment.trim() || !newReview.service_type.trim() || isSubmittingReview) return;

    setIsSubmittingReview(true);
    try {
      await createReview({
        user_id: currentUser.id,
        booking_id: '',
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        service_type: newReview.service_type.trim(),
      } as any);
      await fetchReviews();
      
      // Reset form
      setNewReview({
        rating: 0,
        comment: '',
        service_type: ''
      });
      setShowReviewForm(false);
      
      // Show success message (you could add a toast notification here)
      alert('Thank you for your review! It has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitContact = async () => {
    if (!currentUser || !contactForm.subject.trim() || !contactForm.message.trim() || isSubmittingContact) return;
    if (!isSupabaseConfigured || error) {
      alert('Service is currently unavailable. Please try again later.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      // Create or reuse a ticket and attach the contact inquiry
      let activeTicketId = ticketId;
      if (!activeTicketId) {
        const ticket = await getOrCreateSupportTicket(currentUser.id, contactForm.subject.trim(), 'Contact inquiry from Support Center');
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
      
      // Reset form
      setContactForm({
        subject: '',
        message: ''
      });
      
      // Show success message
      alert('Your message has been sent successfully! We will get back to you soon.');
    } catch (error) {
      console.error('Error sending contact message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
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
      answer: "We accept all major credit cards, debit cards, and mobile payments. Payment is processed securely through our platform."
    },
    {
      question: "Do you offer pickup and delivery?",
      answer: "Yes! We offer free pickup and delivery within Lagos. Schedule through your dashboard or contact us directly."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "Your satisfaction is our priority. Contact us within 24 hours and we'll make it right with a re-clean or full refund."
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-32">
      <ServiceStatusBanner errorMessage={error} />
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Get help when you need it - we're here to assist you</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
            {[
              { id: 'chat', label: 'Live Chat', icon: MessageCircle },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'faq', label: 'FAQ', icon: AlertCircle },
              { id: 'contact', label: 'Contact', icon: Phone }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800">
        {activeTab === 'chat' && (
          <div className="h-[600px] md:h-[700px] flex flex-col">
            {/* Mobile: Show either chat list or conversation, not both */}
            <div className="md:hidden">
              {!ticketId ? (
                /* Mobile Chat List */
                <div className="h-full flex flex-col">
                  {/* Chat List Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your Conversations</h3>
                      <button
                        onClick={startNewChat}
                        disabled={isLoading}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        <span>New Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Chat List */}
                  <div className="flex-1 overflow-y-auto p-2">
                    {Array.isArray((state as any).supportTickets) && (state as any).supportTickets.length > 0 ? (
                      <div className="space-y-2">
                        {(state as any).supportTickets.map((ticket: any) => {
                          const messagesForTicket = ((state as any).supportMessages || []).filter((m: any) => m.ticket_id === ticket.id);
                          const lastMsg = messagesForTicket.slice(-1)[0];
                          const isOpen = ticket.status === 'open' || ticket.status === 'in_progress';
                          
                          return (
                            <button
                              key={ticket.id}
                              onClick={() => setTicketId(ticket.id)}
                              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {ticket.subject || 'Support Ticket'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isOpen 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {isOpen ? 'Open' : 'Closed'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {lastMsg ? lastMsg.message : 'No messages yet'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {formatDate(ticket.created_at)}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Start a new chat to get help</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mobile Conversation View */
                <div className="h-full flex flex-col">
                  {/* Mobile Conversation Header with Back Button */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    {(() => {
                      const selectedTicket = ((state as any).supportTickets || []).find((t: any) => t.id === ticketId);
                      const isOpen = selectedTicket?.status === 'open' || selectedTicket?.status === 'in_progress';
                      
                      return (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setTicketId(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          >
                            ← Back
                          </button>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {selectedTicket?.subject || 'Support Ticket'}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Status: <span className={`${isOpen ? 'text-green-600' : 'text-gray-600'}`}>
                                {isOpen ? 'Open' : 'Closed'}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Mobile Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No messages in this conversation</p>
                      </div>
                    ) : (
                      currentMessages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                              message.sender_type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="break-words">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_type === 'user' 
                                ? 'text-blue-100' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Mobile Message Input */}
                  {(() => {
                    const selectedTicket = ((state as any).supportTickets || []).find((t: any) => t.id === ticketId);
                    const isOpen = selectedTicket?.status === 'open' || selectedTicket?.status === 'in_progress';
                    
                    return (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        {isOpen ? (
                          <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your message..."
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                              disabled={isLoading}
                            />
                            <button
                              type="submit"
                              disabled={isLoading || !newMessage.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </form>
                        ) : (
                          <div className="text-center">
                            <button
                              onClick={startNewChat}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                              Start New Chat
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Desktop: Two-panel layout */}
            <div className="hidden md:flex md:flex-row h-full">
              {/* Left Panel - Chat List */}
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                {/* Chat List Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your Conversations</h3>
                    <button
                      onClick={startNewChat}
                      disabled={isLoading}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New Chat</span>
                    </button>
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {Array.isArray((state as any).supportTickets) && (state as any).supportTickets.length > 0 ? (
                    <div className="space-y-2">
                      {(state as any).supportTickets.map((ticket: any) => {
                        const messagesForTicket = ((state as any).supportMessages || []).filter((m: any) => m.ticket_id === ticket.id);
                        const lastMsg = messagesForTicket.slice(-1)[0];
                        const isOpen = ticket.status === 'open' || ticket.status === 'in_progress';
                        const isSelected = ticketId === ticket.id;
                        
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => setTicketId(ticket.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {ticket.subject || 'Support Ticket'}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isOpen 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {isOpen ? 'Open' : 'Closed'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {lastMsg ? lastMsg.message : 'No messages yet'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatDate(ticket.created_at)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Start a new chat to get help</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Conversation View */}
              <div className="flex-1 flex flex-col">
                {ticketId ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      {(() => {
                        const selectedTicket = ((state as any).supportTickets || []).find((t: any) => t.id === ticketId);
                        const isOpen = selectedTicket?.status === 'open' || selectedTicket?.status === 'in_progress';
                        
                        return (
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {selectedTicket?.subject || 'Support Ticket'}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Status: <span className={`${isOpen ? 'text-green-600' : 'text-gray-600'}`}>
                                  {isOpen ? 'Open' : 'Closed'}
                                </span>
                              </p>
                            </div>
                            <button
                              onClick={() => setTicketId(null)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {currentMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No messages in this conversation</p>
                        </div>
                      ) : (
                        currentMessages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                message.sender_type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <p className="break-words">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_type === 'user' 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    {(() => {
                      const selectedTicket = ((state as any).supportTickets || []).find((t: any) => t.id === ticketId);
                      const isOpen = selectedTicket?.status === 'open' || selectedTicket?.status === 'in_progress';
                      
                      return (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                          {isOpen ? (
                            <form onSubmit={handleSendMessage} className="flex space-x-3">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                disabled={isLoading}
                              />
                              <button
                                type="submit"
                                disabled={isLoading || !newMessage.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                <Send className="h-4 w-4" />
                                <span>Send</span>
                              </button>
                            </form>
                          ) : (
                            <div className="text-center">
                              <button
                                onClick={startNewChat}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                              >
                                Start New Chat
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  /* Default state - no conversation selected */
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a conversation</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Reviews Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Average Rating */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </div>
                  <div>
                    {renderStars(Math.round(averageRating), 'lg')}
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Based on {reviews?.length || 0} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-1 sm:space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 w-6 sm:w-8">
                      {rating}★
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-yellow-400 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 w-6 sm:w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Review Button */}
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Write a Review</span>
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
                
                {/* Service Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={newReview.service_type}
                    onChange={(e) => setNewReview({ ...newReview, service_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a service</option>
                    <option value="Office Cleaning">Office Cleaning</option>
                    <option value="House Cleaning">House Cleaning</option>
                    <option value="Post-Construction Cleaning">Post-Construction Cleaning</option>
                    <option value="Rug & Tiles Cleaning">Rug & Tiles Cleaning</option>
                    <option value="Couch Cleaning">Couch Cleaning</option>
                    <option value="Laundry Service">Laundry Service</option>
                    <option value="Dry Cleaning">Dry Cleaning</option>
                    <option value="Ironing Service">Ironing Service</option>
                    <option value="Express Service">Express Service</option>
                  </select>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`p-1 rounded ${
                          star <= newReview.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {newReview.rating > 0 ? `${newReview.rating}/5` : 'Select rating'}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with our service..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewReview({ rating: 0, comment: '', service_type: '' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={!newReview.rating || !newReview.comment.trim() || !newReview.service_type.trim() || isSubmittingReview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Star className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No reviews yet</h3>
                  <p className="text-xs sm:text-sm text-gray-500 px-4">
                    Your reviews will appear here after you complete services.
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-3 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-gray-100 rounded-full">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {review.rating}/5
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {review.service_type} • {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="border border-gray-200 rounded-lg">
                <summary className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 font-medium text-gray-900 text-xs sm:text-sm">
                  {item.question}
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Phone Support</h3>
                    <p className="text-gray-600 mb-2 text-xs sm:text-sm">Call us directly for immediate assistance</p>
                    <p className="text-blue-600 font-medium text-xs sm:text-sm">+234 903 484 2430</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Email Support</h3>
                    <p className="text-gray-600 mb-2 text-xs sm:text-sm">Send us a detailed message</p>
                    <a 
                      href="mailto:contactneatrix@gmail.com" 
                      className="text-blue-600 font-medium hover:text-blue-700 text-xs sm:text-sm break-all"
                    >
                      contactneatrix@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Service Area</h3>
                    <p className="text-gray-600 mb-2 text-xs sm:text-sm">We currently serve</p>
                    <p className="text-blue-600 font-medium text-xs sm:text-sm">Lagos Only</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Business Hours</h3>
                    <p className="text-gray-600 mb-2 text-xs sm:text-sm">We're available</p>
                    <p className="text-blue-600 font-medium text-xs sm:text-sm">Mon-Sat: 8AM-6PM</p>
                    <p className="text-gray-500 text-xs">Sunday: By appointment</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Form */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Quick Contact</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm resize-none"
                      placeholder="Describe your inquiry..."
                    />
                  </div>
                  <button 
                    onClick={handleSubmitContact}
                    disabled={!contactForm.subject.trim() || !contactForm.message.trim() || isSubmittingContact}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                  >
                    {isSubmittingContact ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;