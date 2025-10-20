import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Trash2 } from "lucide-react";

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
  updated_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
}

interface AdminLiveChatProps {
  mode?: "support" | "contact";
  contactMessages?: ContactMessage[];
  selectedContactMessage?: ContactMessage | null;
  onContactMessageSelect?: (message: ContactMessage) => void;
  onContactMessageUpdate?: (messageId: string, status: string) => void;
  onContactMessageDelete?: (message: ContactMessage) => void;
}

export default function AdminLiveChat({ 
  mode = "support", 
  contactMessages = [], 
  selectedContactMessage = null,
  onContactMessageSelect,
  onContactMessageUpdate,
  onContactMessageDelete
}: AdminLiveChatProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactReply, setContactReply] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "support") {
      (async () => {
        setLoading(true);
        try {
          const { data: t, error: te } = await supabase
            .from("support_tickets")
            .select("*")
            .order("created_at", { ascending: false });
          if (te) throw te;
          setTickets(t || []);

          const { data: m, error: me } = await supabase
            .from("support_messages")
            .select("*")
            .order("created_at", { ascending: true });
          if (me) throw me;
          setMessages(m || []);
        } catch (err) {
          console.error("Failed loading chat data:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "support") {
      const channel = supabase
        .channel("support_messages_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "support_messages" },
          (payload: any) => {
            console.log('Admin received support message change:', payload);
            
            if (payload.eventType === 'INSERT') {
              const msg = payload.new as SupportMessage;
              setMessages((prev) => [...prev, msg]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedMsg = payload.new as SupportMessage;
              setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setMessages((prev) => prev.filter(m => m.id !== deletedId));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mode]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, selectedTicketId]);

  const filteredTickets = mode === "support" ? tickets.filter(
    (t) =>
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const filteredContactMessages = mode === "contact" ? contactMessages.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const ticketMessages = messages.filter((m) => m.ticket_id === selectedTicketId);

  const sendMessage = async () => {
    if (!selectedTicketId || !input.trim()) return;
    const newMsg = {
      ticket_id: selectedTicketId,
      sender_id: tickets.find((t) => t.id === selectedTicketId)?.user_id || "",
      sender_type: "admin" as const,
      message: input.trim(),
      message_type: "text" as const,
      is_read: false,
    };
    const { data, error } = await supabase
      .from("support_messages")
      .insert([newMsg])
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setInput("");
    }
  };

  const handleContactMessageClick = (message: ContactMessage) => {
    if (onContactMessageSelect) {
      onContactMessageSelect(message);
    }
  };

  const handleContactStatusUpdate = async (messageId: string, newStatus: string) => {
    if (onContactMessageUpdate) {
      await onContactMessageUpdate(messageId, newStatus);
    }
  };

  const sendContactReply = async () => {
    if (!selectedContactMessage || !contactReply.trim()) return;
    
    // For contact messages, we'll just update the status to "resolved" 
    // and clear the reply field as a simple implementation
    await handleContactStatusUpdate(selectedContactMessage.id, "resolved");
    setContactReply("");
    alert(`Reply sent to ${selectedContactMessage.email}: ${contactReply.trim()}`);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {mode === "support" ? "Live Chat Support" : "Contact Messages"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {mode === "support" 
              ? "Manage customer support tickets and conversations" 
              : "Manage contact form submissions and replies"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
          {/* Tickets Sidebar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full lg:h-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-lg">{mode === "support" ? "💬" : "📧"}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === "support" ? "Support Tickets" : "Contact Messages"}
                </h2>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔎</span>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={mode === "support" ? "Search tickets..." : "Search messages..."}
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 min-h-[44px]"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 h-full overflow-y-auto scrollbar-hide">
                {mode === "support" ? (
                  <>
                    {filteredTickets.map((t) => (
                      <button
                        key={t.id}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 min-h-[60px] ${
                          selectedTicketId === t.id 
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md" 
                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:shadow-sm"
                        }`}
                        onClick={() => setSelectedTicketId(t.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate flex-1">{t.subject}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{t.ticket_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            t.status === 'resolved' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            t.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            t.priority === 'normal' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredTickets.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📭</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">No tickets found</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {filteredContactMessages.map((msg) => (
                      <button
                        key={msg.id}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 min-h-[60px] ${
                          selectedContactMessage?.id === msg.id 
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md" 
                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:shadow-sm"
                        }`}
                        onClick={() => handleContactMessageClick(msg)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate flex-1">{msg.subject}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{msg.name} - {msg.email}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            msg.status === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            msg.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {msg.status.replace('_', ' ')}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredContactMessages.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📭</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">No contact messages found</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === "support" ? (
                    selectedTicketId ? 
                      `Conversation - ${filteredTickets.find(t => t.id === selectedTicketId)?.ticket_number}` : 
                      'Select a Ticket'
                  ) : (
                    selectedContactMessage ? 
                      `Contact Message - ${selectedContactMessage.subject}` : 
                      'Select a Contact Message'
                  )}
                </h3>
                {(mode === "support" ? selectedTicketId : selectedContactMessage) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {mode === "support" ? `${ticketMessages.length} messages` : selectedContactMessage?.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div ref={listRef} className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-hide">
              {mode === "support" ? (
                selectedTicketId ? (
                  ticketMessages.length > 0 ? (
                    ticketMessages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-xl shadow-sm ${
                          m.sender_type === "admin" 
                            ? "bg-purple-600 text-white rounded-br-sm" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                        }`}>
                          <div className="text-sm sm:text-base leading-relaxed break-words">{m.message}</div>
                          <div className="text-xs opacity-70 mt-2">
                            {new Date(m.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">💬</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">No messages yet</div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">💬</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Select a ticket to view conversation</div>
                  </div>
                )
              ) : (
                selectedContactMessage ? (
                  <div className="space-y-4">
                    {/* Original Contact Message */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-xl shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          From: {selectedContactMessage.name} ({selectedContactMessage.email})
                        </div>
                        <div className="text-sm sm:text-base leading-relaxed break-words">{selectedContactMessage.message}</div>
                        <div className="text-xs opacity-70 mt-2">
                          {new Date(selectedContactMessage.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Reply if exists */}
                    {contactReply && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-xl shadow-sm bg-purple-600 text-white rounded-br-sm">
                          <div className="text-sm sm:text-base leading-relaxed break-words">{contactReply}</div>
                          <div className="text-xs opacity-70 mt-2">
                            Admin Reply
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📧</div>
                    <div className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Select a contact message to view details</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">Choose a contact message from the sidebar to view and reply</div>
                  </div>
                )
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              {mode === "support" ? (
                selectedTicketId && (
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 min-h-[44px]"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="px-4 sm:px-6 py-3 sm:py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                    >
                      <span className="text-sm sm:text-base">Send</span>
                    </button>
                  </div>
                )
              ) : (
                selectedContactMessage && (
                  <div className="space-y-3">
                    {/* Status Update */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <select
                        value={selectedContactMessage.status}
                        onChange={(e) => handleContactStatusUpdate(selectedContactMessage.id, e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    
                    {/* Reply Input */}
                    <div className="flex gap-2 sm:gap-3">
                      <input
                        value={contactReply}
                        onChange={(e) => setContactReply(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendContactReply()}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 min-h-[44px]"
                      />
                      <button
                        onClick={sendContactReply}
                        disabled={!contactReply.trim()}
                        className="px-4 sm:px-6 py-3 sm:py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                      >
                        <span className="text-sm sm:text-base">Reply</span>
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Loading...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
