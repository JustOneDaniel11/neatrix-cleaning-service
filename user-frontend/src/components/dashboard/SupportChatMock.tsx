import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Clock, CheckCircle, ArrowLeft, Search, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import chatsSeed from "@/mock/supportChats.json";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";
import { isSupabaseConfigured } from "@/lib/supabase";

type Sender = "user" | "support" | "system";
type MsgType = "text" | "image" | "file" | "system";

interface ChatMessage {
  id: string;
  sender: Sender;
  type: MsgType;
  content: string;
  createdAt: string;
  status?: "sending" | "delivered" | "read";
}

interface ChatItem {
  id: string;
  subject: string;
  status: "open" | "closed";
  createdAt: string;
  hasSentDefaultMessage: boolean;
  messages: ChatMessage[];
}

const LS_KEY_PREFIX = "neatrix_support_chats_";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
};

const getLastActivity = (chat: ChatItem) => {
  const last = chat.messages[chat.messages.length - 1];
  return last ? last.createdAt : chat.createdAt;
};

const SupportChatMock: React.FC = () => {
  const { state, getOrCreateSupportTicket, createSupportMessage } = useSupabaseData() as any;
  const currentUserId = (state as any)?.currentUser?.id || "default";
  const lsKey = `${LS_KEY_PREFIX}${currentUserId}`;

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  // Composer for open chats only
  const [newMessage, setNewMessage] = useState("");
  const [view, setView] = useState<"list" | "detail">("list");
  const [tab, setTab] = useState<"closed" | "open">("closed");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "7" | "30">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from localStorage, else seed
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      const seed: ChatItem[] = (chatsSeed as any).map((c: any) => ({
        id: c.id,
        subject: c.subject,
        status: c.status,
        createdAt: c.createdAt,
        hasSentDefaultMessage: !!c.hasSentDefaultMessage,
        messages: c.messages,
      }));
      setChats(raw ? JSON.parse(raw) : seed);
    } catch {
      setChats((chatsSeed as any) as ChatItem[]);
    }
  }, [lsKey]);

  // Persist
  useEffect(() => {
    // Do not persist empty chats (no user messages yet)
    const persistable = chats.filter(c => (c.messages || []).length > 0);
    localStorage.setItem(lsKey, JSON.stringify(persistable));
  }, [lsKey, chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, chats]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId) || null, [chats, activeChatId]);
  const filteredByDate = (items: ChatItem[]) => {
    if (dateFilter === "all") return items;
    const days = dateFilter === "7" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return items.filter(c => new Date(getLastActivity(c)).getTime() >= cutoff);
  };
  const filteredBySearch = (items: ChatItem[]) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => c.subject.toLowerCase().includes(q));
  };
  const computeUnread = (c: ChatItem) => c.messages.filter(m => m.sender === "support" && m.status !== "read").length;
  const openChats = useMemo(() => {
    // Exclude empty drafts from list
    const arr = filteredBySearch(filteredByDate(chats.filter(c => c.status === "open" && (c.messages || []).length > 0)));
    return arr.sort((a,b)=> new Date(getLastActivity(b)).getTime() - new Date(getLastActivity(a)).getTime());
  }, [chats, searchQuery, dateFilter]);
  const closedChats = useMemo(() => {
    // Exclude empty drafts from list
    const arr = filteredBySearch(filteredByDate(chats.filter(c => c.status === "closed" && (c.messages || []).length > 0)));
    return arr.sort((a,b)=> new Date(getLastActivity(b)).getTime() - new Date(getLastActivity(a)).getTime());
  }, [chats, searchQuery, dateFilter]);

  const startNewChat = async () => {
    const id = `chat_${Date.now()}`;
    const chat: ChatItem = {
      id,
      subject: "New Conversation",
      status: "open",
      createdAt: new Date().toISOString(),
      hasSentDefaultMessage: false,
      messages: [],
    };
    setChats(prev => [...prev, chat]);
    setActiveChatId(id);
    setView("detail");
    setTab("open");
  };

  // Mark support messages as read when opening a chat detail
  useEffect(() => {
    if (view !== "detail" || !activeChatId) return;
    setChats(prev => prev.map((c): ChatItem => {
      if (c.id !== activeChatId) return c;
      const updated: ChatMessage[] = c.messages.map((m): ChatMessage =>
        m.sender === "support" ? { ...m, status: "read" as const } : m
      );
      return { ...c, messages: updated };
    }));
  }, [view, activeChatId]);

  const closeChat = (id: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, status: "closed" } : c));
  };

  const sendMessage = async () => {
    if (!activeChat) return;
    if (activeChat.status !== "open") return; // Only allow sending on open chats
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const isFirstUserMessage = activeChat.messages.filter(m => m.sender === "user").length === 0;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      type: "text",
      content: trimmed,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    let nextChat: ChatItem = { ...activeChat, messages: [...activeChat.messages, userMsg] };

    if (isFirstUserMessage && !nextChat.hasSentDefaultMessage) {
      const defaultMsg: ChatMessage = {
        id: `sys_${Date.now()}`,
        sender: "support",
        type: "system",
        content: "Hello! 👋 Thanks for reaching out. Please drop your message and one of our customer service representatives will get back to you soon.",
        createdAt: new Date().toISOString(),
        status: "delivered",
      };
      nextChat = { ...nextChat, hasSentDefaultMessage: true, messages: [...nextChat.messages, defaultMsg] };
    }

    setChats(prev => prev.map(c => c.id === nextChat.id ? nextChat : c));
    setNewMessage("");

    // Simulate delivery after short delay
    setTimeout(() => {
      setChats(prev => prev.map((c): ChatItem => {
        if (c.id !== nextChat.id) return c;
        const updated: ChatMessage[] = c.messages.map((m): ChatMessage =>
          m.id === userMsg.id ? { ...m, status: "delivered" as const } : m
        );
        return { ...c, messages: updated };
      }));
    }, 500);

    // Forward to admin via Supabase if available
    try {
      if (isSupabaseConfigured && (state as any)?.currentUser?.id) {
        const ticket = await getOrCreateSupportTicket((state as any).currentUser.id);
        await createSupportMessage({
          ticket_id: ticket.id,
          sender_id: (state as any).currentUser.id,
          sender_type: "user",
          message: trimmed,
          message_type: "text",
          is_read: false,
        });
      }
    } catch (err) {
      console.warn("Failed to send message to Supabase; staying local:", err);
    }
  };

  return (
    <div className="min-h-[70vh] bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 relative">
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {view === "detail" && (
            <button onClick={() => { if (activeChat && (activeChat.messages || []).length === 0) { setChats(prev => prev.filter(c => c.id !== activeChat.id)); } setView("list"); setActiveChatId(null); }} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Support Chat</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Modern, minimal chat experience</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === "detail" && activeChat && (
            <button
              onClick={() => closeChat(activeChat.id)}
              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200"
            >
              Mark as Closed
            </button>
          )}
          {view === "list" && (
            <button onClick={startNewChat} className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Start New Chat</button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Your Conversations</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3 w-3 absolute left-2 top-2.5 text-gray-400" />
                  <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search subject" className="pl-7 pr-2 py-1.5 text-xs border rounded-md bg-white dark:bg-gray-900" />
                </div>
                <select value={dateFilter} onChange={(e)=>setDateFilter(e.target.value as any)} className="text-xs border rounded-md py-1.5 px-2 bg-white dark:bg-gray-900">
                  <option value="all">All dates</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={()=>setTab("open")} className={`px-3 py-1.5 text-xs rounded-md ${tab==='open'?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Open</button>
              <button onClick={()=>setTab("closed")} className={`px-3 py-1.5 text-xs rounded-md ${tab==='closed'?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Closed</button>
            </div>
            {(tab === 'closed' ? closedChats : openChats).length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-300">{tab === 'closed' ? 'No closed conversations yet.' : 'No open conversations yet.'}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(tab==='closed'?closedChats:openChats).map((c) => {
                  const last = c.messages[c.messages.length - 1];
                  const unread = computeUnread(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setActiveChatId(c.id); setView("detail"); }}
                      className="text-left border border-gray-200 dark:border-gray-800 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{unread>0? 'S':'U'}</div>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{c.subject}</span>
                        </div>
                        <span className="flex items-center space-x-1 text-[10px] sm:text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(getLastActivity(c))}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{c.status === 'closed' ? 'Closed' : 'Open'}</span>
                        <CheckCircle className="h-3 w-3 text-gray-400" />
                        {unread>0 && (<span className="ml-auto text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">{unread} unread</span>)}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 truncate">{last ? last.content : "No messages"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {view === "detail" && activeChat && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-[60vh] sm:h-[70vh]"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChat.messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                    m.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}>
                    <p className="text-xs sm:text-sm">{m.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[10px] ${m.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{formatTime(m.createdAt)}</p>
                      {m.sender === "user" && (
                        <span className="text-[10px] text-blue-100">{m.status === 'sending' ? 'Sending…' : m.status === 'delivered' ? 'Delivered' : 'Read'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {activeChat.status === "open" ? (
              <div className="border-t border-gray-200 dark:border-gray-800 p-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
                <div className="flex space-x-2">
                  <input
                    value={newMessage}
                    onChange={(e)=>setNewMessage(e.target.value)}
                    onKeyDown={(e)=>{ if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-center">
                <button
                  onClick={startNewChat}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  New Chat
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removed floating button to avoid duplication; header + bottom button remain */}
    </div>
  );
};

export default SupportChatMock;