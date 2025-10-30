import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageCircle, Send, User, Clock, Wifi, ArrowLeft } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

// Type definitions from the context
interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "user" | "admin";
  message: string;
  message_type: "text" | "image" | "file";
  is_read: boolean;
  created_at: string;
}

interface User {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string;
  created_at?: string;
}

const IntegratedLiveChat: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Supabase context - using existing data without refetching
  const { 
    state, 
    sendSupportMessage,
    updateSupportTicket 
  } = useSupabaseData();

  const { supportTickets, supportMessages, users } = state;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages, selectedTicket]);

  // Sync selectedTicket with updated data from context (only when supportTickets changes, not selectedTicket)
  useEffect(() => {
    if (selectedTicket) {
      const updatedTicket = supportTickets.find(ticket => ticket.id === selectedTicket.id);
      if (updatedTicket && updatedTicket.status !== selectedTicket.status) {
        console.log('Syncing selectedTicket from context:', updatedTicket.status);
        setSelectedTicket(updatedTicket);
      }
    }
  }, [supportTickets]); // Removed selectedTicket dependency to prevent conflicts

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStatusDropdown) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Debug selectedTicket status changes
  useEffect(() => {
    if (selectedTicket) {
      console.log('selectedTicket status changed:', selectedTicket.status, 'Ticket ID:', selectedTicket.id);
    }
  }, [selectedTicket?.status, selectedTicket?.id]);

  // Filter tickets based on search
  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get messages for selected ticket
  const ticketMessages = selectedTicket 
    ? supportMessages.filter(msg => msg.ticket_id === selectedTicket.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  // Get user info for a ticket
  const getUserInfo = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return {
      name: user?.full_name || 'Unknown User',
      email: user?.email || 'No email'
    };
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await sendSupportMessage({
        ticket_id: selectedTicket.id,
        sender_id: 'admin', // This should be the actual admin ID
        sender_type: 'admin',
        message: newMessage.trim(),
        message_type: 'text',
        is_read: true
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    console.log('handleStatusChange called with:', newStatus);
    setShowStatusDropdown(false);
    
    if (newStatus === 'resolved') {
      console.log('Setting completion modal to true');
      setShowCompletionModal(true);
    } else {
      console.log('Updating ticket status to:', newStatus);
      await updateTicketStatus(newStatus);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) {
      console.log('No selected ticket');
      return;
    }
    
    console.log('Updating ticket:', selectedTicket.id, 'to status:', status);
    try {
      await updateSupportTicket(selectedTicket.id, { status: status as any });
      console.log('Ticket status updated successfully');
      
      // Update the local selectedTicket state to reflect the new status
      console.log('Before state update - selectedTicket.status:', selectedTicket.status);
      setSelectedTicket(prev => {
        const updated = prev ? { ...prev, status: status as any } : null;
        console.log('After state update - new selectedTicket.status:', updated?.status);
        return updated;
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  // Handle completion confirmation
  const handleCompletionConfirm = async () => {
    setShowCompletionModal(false);
    await updateTicketStatus('resolved');
  };

  // Get status label for display
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      default: return status.replace('_', ' ');
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left Panel - Conversations List */}
      <div className={`${showMobileChat ? 'hidden' : 'block'} w-full md:w-1/3 border-r border-gray-700 flex flex-col bg-gray-800`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Chat Sessions</h2>
            <div className="flex items-center gap-1 text-green-400">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-12 h-12 text-gray-500 mb-3" />
              <p className="text-gray-400">No chat sessions found</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredTickets.map((ticket) => {
                const userInfo = getUserInfo(ticket.user_id);
                const lastMessage = ticketMessages.length > 0 
                  ? ticketMessages[ticketMessages.length - 1] 
                  : null;
                
                return (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowMobileChat(true);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-600 border border-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{userInfo.name}</p>
                          <p className="text-xs text-gray-400">{ticket.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatTime(ticket.created_at)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          ticket.status === 'open' ? 'bg-green-900 text-green-200' :
                          ticket.status === 'in_progress' ? 'bg-blue-900 text-blue-200' :
                          ticket.status === 'resolved' ? 'bg-purple-900 text-purple-200' :
                          'bg-gray-600 text-gray-200'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-400 truncate">
                        {lastMessage.sender_type === 'admin' ? 'You: ' : ''}{lastMessage.message}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className={`${showMobileChat ? 'block' : 'hidden md:block'} w-full md:flex-1 flex flex-col bg-gray-900`}>
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {getUserInfo(selectedTicket.user_id).name}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedTicket.subject}</p>
                </div>
                <div className="ml-auto relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusDropdown(!showStatusDropdown);
                      console.log('Status button clicked, current status:', selectedTicket.status);
                    }}
                    className={`px-3 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                      selectedTicket.status === 'open' ? 'bg-green-900 text-green-200' :
                      selectedTicket.status === 'in_progress' ? 'bg-blue-900 text-blue-200' :
                      selectedTicket.status === 'resolved' ? 'bg-purple-900 text-purple-200' :
                      'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {getStatusLabel(selectedTicket.status)}
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange('open');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg"
                      >
                        Open
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange('in_progress');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange('pending');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                      >
                        Pending
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange('resolved');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 last:rounded-b-lg"
                      >
                        Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ticketMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a chat session from the left panel to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Completion Confirmation Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Chat Session</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark this chat as completed? This action will close the conversation.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompletionConfirm}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Complete Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedLiveChat;