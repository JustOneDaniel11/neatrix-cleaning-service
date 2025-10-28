import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { formatDate } from '../lib/utils';
import { 
  Search, 
  Filter, 
  Send, 
  User, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowLeft,
  MoreHorizontal,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface ConversationItem {
  ticket_id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  last_message_preview: string;
  last_message_at: string | null;
  status?: string | null;
  unread_count?: number;
}

export default function IntegratedLiveChat() {
  const { 
    state, 
    fetchSupportTickets, 
    fetchSupportMessages, 
    fetchAllUsers, 
    sendSupportMessage, 
    updateSupportTicket, 
    markMessageAsRead 
  } = useSupabaseData();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showStatusPrompt, setShowStatusPrompt] = useState(false);
  const [statusSelection, setStatusSelection] = useState<string>('in_progress');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Only fetch if functions are available
        const promises = [];
        if (fetchSupportTickets) promises.push(fetchSupportTickets());
        if (fetchSupportMessages) promises.push(fetchSupportMessages());
        if (fetchAllUsers) promises.push(fetchAllUsers());
        
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if we have the necessary functions
    if (fetchSupportTickets && fetchSupportMessages && fetchAllUsers) {
      fetchData();
    } else {
      // If functions aren't available yet, just set loading to false
      setIsLoading(false);
    }
  }, [fetchSupportTickets, fetchSupportMessages, fetchAllUsers]);

  // Build conversations list from tickets + messages + users
  const conversations: ConversationItem[] = useMemo(() => {
    const tickets = state.supportTickets || [];
    const messages = state.supportMessages || [];
    const users = state.users || [];

    const userMap = new Map(users.map(u => [u.id, u]));

    return tickets.map(t => {
      const related = messages.filter(m => m.ticket_id === t.id);
      const last = related.sort((a, b) => (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime())).slice(-1)[0];
      const u = t.user_id ? userMap.get(t.user_id) : null;
      const unread = related.filter(m => m.sender_type === 'user' && !m.is_read).length;
      return {
        ticket_id: t.id,
        user_id: t.user_id || null,
        user_name: u?.full_name || u?.name || u?.email || 'Unnamed',
        user_email: u?.email || 'Unknown',
        last_message_preview: last?.message ? (last.message.length > 60 ? last.message.slice(0, 60) + '…' : last.message) : 'No messages yet',
        last_message_at: last?.created_at || t.created_at || null,
        status: t.status || 'open',
        unread_count: unread,
      } as ConversationItem;
    }).sort((a, b) => {
      const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bt - at;
    });
  }, [state.supportTickets, state.supportMessages, state.users]);

  // Filtered conversations based on search and status
  const filteredConversations = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return conversations.filter(c => {
      const matchesQuery = !q || c.user_name.toLowerCase().includes(q) || c.user_email.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || (c.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [conversations, searchText, statusFilter]);

  // Active messages for the selected ticket
  const activeMessages = useMemo(() => {
    const all = state.supportMessages || [];
    if (!selectedTicketId) return [] as typeof all;
    return all
      .filter(m => m.ticket_id === selectedTicketId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [state.supportMessages, selectedTicketId]);

  // Selected ticket
  const selectedTicket = useMemo(() => {
    const tickets = state.supportTickets || [];
    return tickets.find(t => t.id === selectedTicketId) || null;
  }, [state.supportTickets, selectedTicketId]);

  // Selected conversation
  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.ticket_id === selectedTicketId) || null;
  }, [conversations, selectedTicketId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages]);

  // Mark messages as read when ticket is selected
  useEffect(() => {
    if (selectedTicketId && activeMessages.length > 0) {
      const unreadMessages = activeMessages.filter(m => m.sender_type === 'user' && !m.is_read);
      unreadMessages.forEach(message => {
        markMessageAsRead?.(message.id);
      });
    }
  }, [selectedTicketId, activeMessages, markMessageAsRead]);

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTicketId || !sendSupportMessage) return;

    try {
      await sendSupportMessage(selectedTicketId, replyText.trim(), 'admin');
      setReplyText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTicketId || !updateSupportTicket) return;

    try {
      await updateSupportTicket(selectedTicketId, { status: newStatus });
      setShowStatusPrompt(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return <AlertCircle className="w-3 h-3" />;
      case 'in_progress': return <Clock className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'closed': return <XCircle className="w-3 h-3" />;
      default: return <MessageCircle className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left Panel - Chat Sessions List */}
      <div className={`lg:w-1/3 flex-shrink-0 ${showChatOnMobile ? 'hidden lg:block' : 'block'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Chat Sessions</h3>
              <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${
                state.realTimeConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {state.realTimeConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{state.realTimeConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No chat sessions found</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.ticket_id}
                    onClick={() => {
                      setSelectedTicketId(conversation.ticket_id);
                      setShowChatOnMobile(true);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedTicketId === conversation.ticket_id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {conversation.user_name}
                            </h4>
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium ml-2">
                                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conversation.user_email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 truncate mt-1">
                            {conversation.last_message_preview}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status || 'open')}`}>
                              {getStatusIcon(conversation.status || 'open')}
                              <span className="capitalize">{conversation.status || 'open'}</span>
                            </span>
                            {conversation.last_message_at && (
                              <span className="text-xs text-gray-400">
                                {formatDate(conversation.last_message_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Conversation */}
      <div className={`flex-1 ${!showChatOnMobile ? 'hidden lg:block' : 'block'}`}>
        {selectedTicketId && selectedConversation ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowChatOnMobile(false)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.user_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedConversation.user_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedConversation.status || 'open')}`}>
                    {getStatusIcon(selectedConversation.status || 'open')}
                    <span className="capitalize">{selectedConversation.status || 'open'}</span>
                  </span>
                  <button
                    onClick={() => setShowStatusPrompt(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
              {activeMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages in this conversation yet.</p>
                  <p className="text-sm mt-2">Start the conversation by sending a message below.</p>
                </div>
              ) : (
                activeMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_type === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 h-full flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a chat session from the left panel to start messaging.</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Update Ticket Status
            </h3>
            <div className="space-y-3 mb-6">
              {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusSelection(status)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    statusSelection === status
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusPrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(statusSelection)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}