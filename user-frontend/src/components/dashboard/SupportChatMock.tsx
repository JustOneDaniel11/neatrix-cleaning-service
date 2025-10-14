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
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
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
    <div className="w-full max-w-none bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {view === "detail" && (
            <button onClick={() => { if (activeChat && (activeChat.messages || []).length === 0) { setChats(prev => prev.filter(c => c.id !== activeChat.id)); } setView("list"); setActiveChatId(null); }} className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden flex-shrink-0">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">Support Chat</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block truncate">Modern, minimal chat experience</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {view === "detail" && activeChat && (
            <button
              onClick={() => closeChat(activeChat.id)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span className="hidden sm:inline">Mark as Closed</span>
              <span className="sm:hidden">Close</span>
            </button>
          )}
          {view === "list" && (
            <button onClick={startNewChat} className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <span className="hidden sm:inline">Start New Chat</span>
              <span className="sm:hidden">New</span>
            </button>
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
            className="p-3 sm:p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">Your Conversations</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 absolute left-2 sm:left-3 top-2 sm:top-2.5 text-gray-400" />
                  <input 
                    value={searchQuery} 
                    onChange={(e)=>setSearchQuery(e.target.value)} 
                    placeholder="Search subject" 
                    className="pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full sm:w-auto min-w-0" 
                  />
                </div>
                <select 
                  value={dateFilter} 
                  onChange={(e)=>setDateFilter(e.target.value as any)} 
                  className="text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-md py-1.5 sm:py-2 px-2 sm:px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex-shrink-0"
                >
                  <option value="all">All dates</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
              <button 
                onClick={()=>setTab("open")} 
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${tab==='open'?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Open
              </button>
              <button 
                onClick={()=>setTab("closed")} 
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${tab==='closed'?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Closed
              </button>
            </div>
            {(tab === 'closed' ? closedChats : openChats).length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium mb-2">{tab === 'closed' ? 'No closed conversations yet.' : 'No open conversations yet.'}</p>
                <p className="text-sm">Start a new conversation to get help from our support team.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {(tab==='closed'?closedChats:openChats).map((c) => {
                  const last = c.messages[c.messages.length - 1];
                  const unread = computeUnread(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setActiveChatId(c.id); setView("detail"); }}
                      className="text-left border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
                     >
                       <div className="flex items-center justify-between mb-2 min-w-0 gap-1 sm:gap-2">
                         <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                           <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                             {unread>0? 'S':'U'}
                           </div>
                           <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 truncate min-w-0">{c.subject}</span>
                         </div>
                         <span className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0 ml-1 sm:ml-2 min-w-0">
                           <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                           <span className="truncate text-xs">{formatDate(getLastActivity(c))}</span>
                         </span>
                       </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {c.status === 'closed' ? 'Closed' : 'Open'}
                          </span>
                          <CheckCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        </div>
                        {unread>0 && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full flex-shrink-0 ml-2">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-2 overflow-hidden">
                        {last ? last.content : "No messages"}
                      </p>
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
            className="flex flex-col h-[calc(100vh-16rem)] sm:h-[70vh] max-h-[600px]"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {activeChat.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start the conversation</h3>
                  <p className="text-gray-500 dark:text-gray-300">Send your first message to get help from our support team.</p>
                </div>
              ) : (
                activeChat.messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} px-1`}>
                    <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg break-words ${
                      m.sender === "user" 
                        ? "bg-blue-600 text-white rounded-br-sm" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                    }`}>
                      <p className="text-sm leading-relaxed break-words overflow-wrap-anywhere">{m.content}</p>
                      <div className="flex items-center justify-between mt-1.5 gap-2 min-w-0">
                        <p className={`text-xs flex-shrink-0 ${m.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                          {formatTime(m.createdAt)}
                        </p>
                        {m.sender === "user" && (
                          <span className="text-xs text-blue-100 truncate">
                            {m.status === 'sending' ? 'Sending…' : m.status === 'delivered' ? 'Delivered' : 'Read'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {activeChat.status === "open" ? (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                <div className="flex space-x-3">
                  <input
                    value={newMessage}
                    onChange={(e)=>setNewMessage(e.target.value)}
                    onKeyDown={(e)=>{ if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 text-center">
                <p className="text-gray-500 dark:text-gray-300 mb-4">This conversation has been closed.</p>
                <button
                  onClick={startNewChat}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start New Chat
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportChatMock;