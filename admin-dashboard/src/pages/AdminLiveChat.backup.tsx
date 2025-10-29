import React, { useEffect, useRef, useState, useMemo } from "react";

import { Trash2, User, Clock, MessageCircle, XCircle } from "lucide-react";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";
import { supabase } from "@/lib/supabase";

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
  const { state, fetchSupportTickets, fetchSupportMessages, fetchAllUsers, sendSupportMessage, updateSupportTicket } = useSupabaseData();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactReply, setContactReply] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactReplies, setContactReplies] = useState<Record<string, string[]>>({});
  const listRef = useRef<HTMLDivElement>(null);

  const [showStatusPrompt, setShowStatusPrompt] = useState(false);
  const [statusSelection, setStatusSelection] = useState<'resolved' | 'in_progress' | 'new'>('resolved');
  const [autoScroll, setAutoScroll] = useState(true);

  // Hydrate context on mount; realtime subscriptions in context will keep data fresh
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSupportTickets?.(),
          fetchSupportMessages?.(),
          fetchAllUsers?.(),
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchSupportTickets, fetchSupportMessages, fetchAllUsers]);

  // Realtime is handled centrally in SupabaseDataContext; no local channel needed
  useEffect(() => {
    // no-op
  }, []);

  // Track user scrolling to toggle auto-scroll behavior
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAutoScroll(distanceFromBottom < 120);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!listRef.current || !autoScroll) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [autoScroll, state?.supportMessages, selectedTicketId, contactReplies, selectedContactId]);

  const filteredTickets = mode === "support" ? (state?.supportTickets ?? []).filter(
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

  const conversations = useMemo(() => {
    const tickets = state?.supportTickets ?? [];
    const msgs = state?.supportMessages ?? [];
    const users = state?.users ?? [];

    const items = tickets.map((t) => {
      const tMsgs = msgs.filter((m) => m.ticket_id === t.id);
      const last = tMsgs.length
        ? tMsgs.reduce((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b))
        : undefined;
      const u = users.find((u) => u.id === t.user_id);
      const userName = u?.full_name || (u?.email ? u.email.split('@')[0] : `User ${t.user_id.slice(0,6)}`);
      return {
        ticket: t,
        lastMessage: last?.message || t.description || "",
        lastTime: last?.created_at || t.created_at,
        userName,
        userEmail: u?.email || "",
        userId: t.user_id,
      };
    });

    return items.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
  }, [state?.supportTickets, state?.supportMessages, state?.users]);

  const ticketMessages = (state?.supportMessages ?? []).filter((m) => m.ticket_id === selectedTicketId);
  const currentTicket = (state?.supportTickets ?? []).find((t) => t.id === selectedTicketId) || null;
  const isClosed = currentTicket?.status === 'closed';

  const sendMessage = async () => {
    if (!selectedTicketId || !input.trim() || isClosed) return;
    const payload = {
      ticket_id: selectedTicketId,
      sender_id: state?.authUser?.id || "admin",
      sender_type: "admin" as const,
      message: input.trim(),
      message_type: "text" as const,
      is_read: false,
    };
    try {
      await sendSupportMessage?.(payload);
      setInput("");
    } catch (e) {
      console.error("Failed to send support message", e);
    }
  };

  const handleContactMessageClick = (message: ContactMessage) => {
    setSelectedContactId(message.id);
    onContactMessageSelect?.(message);
  };

  const handleContactStatusUpdate = async (messageId: string, newStatus: string) => {
    if (onContactMessageUpdate) {
      await onContactMessageUpdate(messageId, newStatus);
    }
  };

  const sendContactReply = async (userId?: string, messageText?: string) => {
    const messageId = userId || selectedContactId || selectedContactMessage?.id || null;
    const reply = (messageText ?? contactReply).trim();
    if (!messageId || !reply) return;
    await handleContactStatusUpdate(messageId, "in_progress");
    try {
      await supabase.from("admin_notifications").insert({
        title: "Contact Reply",
        message: reply,
        status: "unread",
        type: "system",
      });
    } catch (e) {
      console.error("Failed to persist contact reply notification", e);
    }
    // Attempt to notify a registered user whose email matches the contact
    try {
      const contact = contactMessages.find(cm => cm.id === messageId);
      const user = state?.users?.find((u: { id?: string; email?: string }) => u.email && contact?.email && u.email.toLowerCase() === contact.email.toLowerCase());
      if (user?.id) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Support Reply",
          message: reply,
          status: "unread",
          type: "message",
        });
      }
    } catch (e) {
      console.error("Failed to notify registered user", e);
    }
    setContactReplies((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), reply],
    }));
    setContactReply("");
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
                    {filteredContactMessages.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleContactMessageClick(m)}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 min-h-[60px] ${
                          (selectedContactId || selectedContactMessage?.id) === m.id 
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md" 
                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate flex-1">
                            {m.name || m.email}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(m.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{m.subject}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            m.status === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            m.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            m.status === 'resolved' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {m.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{m.message}</div>
                      </button>
                    ))}
                    {filteredContactMessages.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📭</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">No messages found</div>
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
                    selectedTicketId
                      ? `Conversation - ${filteredTickets.find(t => t.id === selectedTicketId)?.ticket_number}`
                      : 'Select a Ticket'
                  ) : (
                    (() => {
                      const c = contactMessages.find(cm => cm.id === (selectedContactId || selectedContactMessage?.id || ""));
                      return c ? `Conversation - ${c.name || c.email}` : 'Select a Conversation';
                    })()
                  )}
                </h3>
                {(mode === "support" ? selectedTicketId : (selectedContactId || selectedContactMessage)) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {mode === "support"
                        ? `${ticketMessages.length} messages`
                        : contactMessages.find(cm => cm.id === (selectedContactId || selectedContactMessage?.id || ""))?.email}
                    </span>
                    {mode === "support" && currentTicket && (
                      <button
                        onClick={async () => {
                          try {
                            await updateSupportTicket?.(currentTicket.id, { status: 'closed' });
                          } catch (e) {
                            console.error('Failed to close ticket', e);
                          }
                        }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-sm hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition text-xs sm:text-sm"
                      >
                        Close Chat
                      </button>
                    )}
                    {mode === "contact" && (selectedContactId || selectedContactMessage?.id) && (
                      <button
                        onClick={() => setShowStatusPrompt(true)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-sm hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition text-xs sm:text-sm"
                      >
                        Close Chat
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div ref={listRef} onMouseDown={() => setAutoScroll(false)} className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-hide">
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
                (() => {
                  const cid = selectedContactId || selectedContactMessage?.id || "";
                  const current = contactMessages.find(cm => cm.id === cid);
                  if (!current) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📧</div>
                        <div className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Select a conversation to view details</div>
                        <div className="text-sm text-gray-400 dark:text-gray-500">Choose a conversation from the sidebar to view and reply</div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="flex justify-start">
                        <div className="max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-xl shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm">
                          <div className="text-sm sm:text-base font-medium">{current.subject}</div>
                          <div className="text-sm sm:text-base leading-relaxed break-words mt-1">{current.message}</div>
                          <div className="text-xs opacity-70 mt-2">
                            From: {current.name || current.email} • {new Date(current.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {(contactReplies[cid] || []).map((reply, idx) => (
                        <div key={idx} className="flex justify-end">
                          <div className="max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-xl shadow-sm bg-purple-600 text-white rounded-br-sm">
                            <div className="text-sm sm:text-base leading-relaxed break-words">{reply}</div>
                            <div className="text-xs opacity-70 mt-2">{new Date().toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()
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
                      disabled={isClosed}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isClosed}
                      className="px-4 sm:px-6 py-3 sm:py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                    >
                      <span className="text-sm sm:text-base">Send</span>
                    </button>
                  </div>
                )
              ) : (
                (selectedContactId || selectedContactMessage?.id) && (
                  <div className="space-y-2">
                    <textarea
                      value={contactReply}
                      onChange={(e) => setContactReply(e.target.value)}
                      rows={3}
                      placeholder="Type your reply…"
                      className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 min-h-[44px]"
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => sendContactReply()}
                        disabled={!contactReply.trim()}
                        className="px-4 sm:px-6 py-3 sm:py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 min-h-[44px]"
                      >
                        Send Reply
                      </button>
                      <button
                        onClick={async () => {
                          const id = selectedContactId || selectedContactMessage?.id;
                          if (id) {
                            await handleContactStatusUpdate(id, "resolved");
                          }
                        }}
                        className="px-3 sm:px-4 py-3 sm:py-2.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                      >
                        Mark Resolved
                      </button>
                      {onContactMessageDelete && (
                        <button
                          onClick={() => {
                            const cid = selectedContactId || selectedContactMessage;
                            if (cid) {
                              const messageToDelete = typeof cid === 'string' 
                                ? contactMessages.find(cm => cm.id === cid) 
                                : cid;
                              if (messageToDelete) {
                                onContactMessageDelete(messageToDelete);
                              }
                            }
                          }}
                          className="px-3 sm:px-4 py-3 sm:py-2.5 border rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 text-red-600 min-h-[44px] flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      )}
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

        {showStatusPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Set conversation status</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">What is the current state?</p>
              </div>
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input type="radio" name="contact-status" checked={statusSelection === 'resolved'} onChange={() => setStatusSelection('resolved')} />
                  <span>Completed</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="contact-status" checked={statusSelection === 'in_progress'} onChange={() => setStatusSelection('in_progress')} />
                  <span>Pending</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="contact-status" checked={statusSelection === 'new'} onChange={() => setStatusSelection('new')} />
                  <span>New</span>
                </label>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button onClick={() => setShowStatusPrompt(false)} className="px-3 py-2 border rounded-lg">Cancel</button>
                <button
                  onClick={async () => {
                    const id = selectedContactId || selectedContactMessage?.id;
                    if (!id) return;
                    await handleContactStatusUpdate(id, statusSelection);
                    setShowStatusPrompt(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
