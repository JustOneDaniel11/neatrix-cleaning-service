import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

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

export default function AdminLiveChat() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, selectedTicketId]);

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Live Chat Support</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage customer support tickets and conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
          {/* Tickets Sidebar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full lg:h-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-lg">💬</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔎</span>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 min-h-[44px]"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 h-full overflow-y-auto scrollbar-hide">
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
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedTicketId ? 
                    `Conversation - ${filteredTickets.find(t => t.id === selectedTicketId)?.ticket_number}` : 
                    'Select a Ticket'
                  }
                </h3>
                {selectedTicketId && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {ticketMessages.length} messages
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div ref={listRef} className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-hide">
              {selectedTicketId ? (
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
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">💬</div>
                  <div className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Select a ticket to view messages</div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">Choose a support ticket from the sidebar to start chatting</div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-2 sm:gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={selectedTicketId ? "Type a message..." : "Select a ticket first"}
                  disabled={!selectedTicketId}
                  className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 sm:py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!selectedTicketId || !input.trim()}
                  className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[80px] flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Send</span>
                  <span className="sm:hidden">📤</span>
                </button>
              </div>
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
