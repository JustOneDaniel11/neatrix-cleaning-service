import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  DollarSign,
  Bell,
  Search,
  Filter,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useSupabaseData } from "../contexts/SupabaseDataContext";
import type { SupportTicket, SupportMessage, ChatSession } from "../contexts/SupabaseDataContext";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  sessionId: string;
}

interface ExtendedChatSession extends ChatSession {
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const AdminDashboard = () => {
  const { 
    state, 
    fetchSupportTickets, 
    fetchSupportMessages, 
    fetchChatSessions,
    createSupportMessage,
    updateChatSession,
    fetchAllUsers
  } = useSupabaseData();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'users' | 'bookings'>('chat');
  const [chatSessions, setChatSessions] = useState<ExtendedChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExtendedChatSession | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchChatSessions(),
          fetchSupportMessages(),
          fetchAllUsers()
        ]);
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };

    loadData();
  }, [fetchChatSessions, fetchSupportMessages, fetchAllUsers]);

  // Transform chat sessions with user data and messages
  useEffect(() => {
    const transformedSessions: ExtendedChatSession[] = state.chatSessions.map(session => {
      const user = state.users.find(u => u.id === session.user_id);
      const sessionMessages = state.supportMessages
        .filter(msg => msg.ticket_id === session.id) // Using session id as ticket id for now
        .map(msg => ({
          id: msg.id,
          userId: msg.sender_id,
          userName: msg.senderName || (msg.sender_type === 'admin' ? 'Support Agent' : user?.full_name || 'Unknown'),
          userEmail: msg.senderEmail || (msg.sender_type === 'admin' ? 'support@neatrix.com' : user?.email || ''),
          message: msg.message,
          timestamp: msg.created_at,
          isRead: msg.is_read,
          sessionId: session.id
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const lastMessage = sessionMessages[sessionMessages.length - 1];
      const unreadCount = sessionMessages.filter(msg => !msg.isRead && msg.userId !== 'admin').length;

      return {
        ...session,
        userName: user?.full_name || 'Unknown User',
        userEmail: user?.email || '',
        lastMessage: lastMessage?.message || 'No messages yet',
        lastMessageTime: lastMessage?.timestamp || session.started_at,
        unreadCount,
        messages: sessionMessages
      };
    });

    setChatSessions(transformedSessions);
  }, [state.chatSessions, state.supportMessages, state.users]);

  const sendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedSession) return;

    try {
      // Create a new support message
      await createSupportMessage({
        ticket_id: selectedSession.id, // Using session id as ticket id
        sender_id: 'admin', // This should be the actual admin user ID
        sender_type: 'admin',
        message: adminMessage,
        message_type: 'text',
        is_read: true
      });

      // Update chat session last activity
      await updateChatSession(selectedSession.id, {
        last_activity: new Date().toISOString()
      });

      // Clear the message input
      setAdminMessage('');

      // Refresh messages
      await fetchSupportMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markSessionAsRead = async (sessionId: string) => {
    try {
      // Mark all messages in this session as read
      const sessionMessages = state.supportMessages.filter(msg => 
        msg.ticket_id === sessionId && !msg.is_read && msg.sender_type === 'user'
      );

      // Update each unread message (in a real implementation, you'd want a batch update)
      for (const message of sessionMessages) {
        // Note: We need to implement updateSupportMessage in the context
        // For now, we'll just refresh the data
      }

      // Refresh data
      await fetchSupportMessages();
    } catch (error) {
      console.error('Error marking session as read:', error);
    }
  };

  const filteredSessions = chatSessions.filter(session =>
    session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadMessages = chatSessions.reduce((total, session) => total + session.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage customer support and operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalUnreadMessages}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'chat', label: `Live Chat (${totalUnreadMessages})`, icon: MessageCircle },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bookings', label: 'Bookings', icon: Calendar }
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Chat Sessions List */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Chats</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {chatSessions.length} sessions
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
                {filteredSessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No active chat sessions</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session);
                        markSessionAsRead(session.id);
                      }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedSession?.id === session.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.userName}
                            </p>
                            <div className="flex items-center space-x-2">
                              {session.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {session.unreadCount}
                                </span>
                              )}
                              <span className={`w-2 h-2 rounded-full ${
                                session.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{session.userEmail}</p>
                          <p className="text-sm text-gray-600 truncate">{session.lastMessage}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(session.lastMessageTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
              {selectedSession ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{selectedSession.userName}</h3>
                        <p className="text-sm text-gray-600">{selectedSession.userEmail}</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          selectedSession.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-sm text-gray-600 capitalize">{selectedSession.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedSession.messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      selectedSession.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.userId === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.userId === 'admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.userId === 'admin' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendAdminMessage}
                        disabled={!adminMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a chat session to start responding to customers</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{chatSessions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUnreadMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{state.users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{state.stats.todayBookings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
              <p className="text-gray-600">User management functionality will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Management</h3>
              <p className="text-gray-600">Booking management functionality will be implemented here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;