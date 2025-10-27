import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

// LiveSupportChat: New unified admin live chat page
// - Left: conversations list (all users' support tickets/messages)
// - Right: active chat pane
// - Mobile: full-screen chat with back button
// - Real-time: uses SupabaseDataContext live state

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

export default function LiveSupportChat() {
  const { state, fetchSupportTickets, fetchSupportMessages, fetchAllUsers, sendSupportMessage, updateSupportTicket, markMessageAsRead } = useSupabaseData();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showStatusPrompt, setShowStatusPrompt] = useState(false);
  const [statusSelection, setStatusSelection] = useState<string>('in_progress');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Replace single autoScroll with per-ticket preference
  const [autoScrollByTicket, setAutoScrollByTicket] = useState<Record<string, boolean>>({});
  const currentAutoScroll = useMemo(() => {
    return selectedTicketId ? (autoScrollByTicket[selectedTicketId] ?? true) : true;
  }, [selectedTicketId, autoScrollByTicket]);

  const [autoScroll, setAutoScroll] = useState(true);

  // Initial data fetch
  useEffect(() => {
    fetchSupportTickets?.();
    fetchSupportMessages?.();
    fetchAllUsers?.();
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

  // Add filtered conversations based on search and status
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

  // Selected ticket and chat state
  const selectedTicket = useMemo(() => {
    const tickets = state.supportTickets || [];
    return tickets.find(t => t.id === selectedTicketId) || null;
  }, [state.supportTickets, selectedTicketId]);
  const chatEnded = useMemo(() => {
    const s = selectedTicket?.status;
    return s === 'resolved' || s === 'closed';
  }, [selectedTicket]);

  // Helper function to get sender name
  const getSenderName = (message: { sender_type: string; sender_id: string }) => {
    if (message.sender_type === 'admin') {
      return 'Support Agent';
    } else {
      const users = state.users || [];
      const user = users.find(u => u.id === message.sender_id);
      return user?.full_name || user?.email || 'User';
    }
  };

  // Auto-scroll gating per chat
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!selectedTicketId) return;
      const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
      setAutoScrollByTicket(prev => ({ ...prev, [selectedTicketId]: distanceFromBottom < 120 }));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [messagesContainerRef, selectedTicketId]);

  // Scroll when new messages arrive and we are near bottom
  useEffect(() => {
    if (!currentAutoScroll) return;
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeMessages, currentAutoScroll]);

  // Mark unread user messages as read when viewing a conversation
  useEffect(() => {
    if (!selectedTicketId) return;
    const unread = activeMessages.filter(m => m.sender_type === 'user' && !m.is_read);
    if (unread.length > 0) {
      unread.forEach(m => {
        markMessageAsRead?.(m.id);
      });
    }
  }, [selectedTicketId, activeMessages, markMessageAsRead]);

  const handleSend = async () => {
    if (!replyText.trim() || !selectedTicketId) return;
    await sendSupportMessage?.({
      ticket_id: selectedTicketId,
      sender_id: state.authUser?.id || 'admin',
      sender_type: 'admin',
      message_type: 'text',
      is_read: false,
      message: replyText.trim(),
    });
    setReplyText('');
    setAutoScrollByTicket(prev => ({ ...prev, [selectedTicketId!]: true }));
    // Ensure we snap to bottom on send
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 0);
  };

  // Close chat triggers status prompt
  const handleCloseChat = () => {
    setShowStatusPrompt(true);
  };

  // Apply selected status to the current ticket
  const applyStatus = async () => {
    if (!selectedTicketId) {
      setShowStatusPrompt(false);
      return;
    }
    await updateSupportTicket?.(selectedTicketId, { status: statusSelection });
    setShowStatusPrompt(false);
    // Keep chat open; UI will reflect ended state based on ticket status.
  };

  // Card component with unread badge
  const ConversationCard: React.FC<{ item: ConversationItem; selected: boolean; onClick: () => void }>= ({ item, selected, onClick }) => {
    return (
      <button onClick={onClick} className={`w-full text-left rounded-xl border transition-colors p-4 mb-3 ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-200 hover:bg-neutral-50'}`}> 
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-semibold text-neutral-900 truncate">{item.user_name}</div>
            {item.unread_count && item.unread_count > 0 && (
              <span className="flex-shrink-0 inline-block text-[11px] px-2 py-0.5 rounded-full bg-red-500 text-white">{item.unread_count}</span>
            )}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 capitalize">{item.status || 'open'}</div>
        </div>
        <div className="text-sm text-neutral-700 truncate">{item.user_email}</div>
        <div className="mt-1 text-sm text-neutral-600 line-clamp-2">{item.last_message_preview}</div>
      </button>
    );
  };

  const HeaderBar: React.FC<{ title: string; right?: React.ReactNode; back?: () => void }>= ({ title, right, back }) => (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white">
      <div className="flex items-center gap-2">
        {back && (
          <button onClick={back} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <span>←</span>
            <span>Back</span>
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900">{title}</h2>
      </div>
      {right}
    </div>
  );

  const CloseChatButton: React.FC<{ onClick: () => void }>= ({ onClick }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      <span className="font-medium">Close Chat</span>
    </button>
  );

  const StatusPromptModal: React.FC<{ open: boolean; onClose: () => void; onApply: () => void }>= ({ open, onClose, onApply }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full sm:w-[28rem] bg-white rounded-t-2xl sm:rounded-2xl shadow-lg">
          <div className="p-4 border-b">
            <div className="text-lg font-semibold">Set Conversation Status</div>
            <div className="text-sm text-neutral-600">Choose how to mark this chat.</div>
          </div>
          <div className="p-4 space-y-3">
            {[
              { key: 'open', label: 'Open' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'pending', label: 'Pending' },
              { key: 'resolved', label: 'Completed' },
              { key: 'closed', label: 'Closed' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-neutral-50 cursor-pointer">
                <input
                  type="radio"
                  name="chat-status"
                  checked={statusSelection === opt.key}
                  onChange={() => setStatusSelection(opt.key)}
                />
                <span className="text-sm font-medium text-neutral-800">{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="p-4 flex items-center justify-end gap-3 border-t">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Cancel</button>
            <button onClick={onApply} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500">Apply</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Desktop split view */}
      <div className="hidden lg:grid grid-cols-12 h-[calc(100vh-120px)]">
        {/* List */}
        <div className="col-span-4 border-r">
          <HeaderBar title="Live Support Chat" />
          <div className="p-4 border-b flex items-center gap-2">
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search by name or email"
              className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="p-4 overflow-y-auto h-full">
            {filteredConversations.length === 0 && (
              <div className="text-sm text-neutral-600">No conversations found.</div>
            )}
            {filteredConversations.map(conv => (
              <ConversationCard
                key={conv.ticket_id}
                item={conv}
                selected={conv.ticket_id === selectedTicketId}
                onClick={() => setSelectedTicketId(conv.ticket_id)}
              />
            ))}
          </div>
        </div>
        {/* Chat */}
        <div className="col-span-8">
          <HeaderBar
            title={selectedTicketId ? 'Active Chat' : 'Select a conversation'}
            back={selectedTicketId ? () => setSelectedTicketId(null) : undefined}
            right={selectedTicketId ? <CloseChatButton onClick={handleCloseChat} /> : null}
          />
          {selectedTicketId ? (
            <div className="flex flex-col h-full" onMouseDown={() => selectedTicketId && setAutoScrollByTicket(prev => ({ ...prev, [selectedTicketId]: false }))}>
              {/* Admin typing indicator */}
              {replyText && !chatEnded && (
                <div className="px-4 pt-2 text-xs text-neutral-500">You are typing…</div>
              )}
              {chatEnded && (
                <div className="px-4 pt-2 text-xs text-neutral-600">This chat has ended. Replies are disabled.</div>
              )}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map(m => (
                  <div key={m.id} className={`max-w-[80%] ${m.sender_type === 'admin' ? 'ml-auto' : ''}`}>
                    <div className={`text-xs mb-1 ${m.sender_type === 'admin' ? 'text-right text-neutral-600' : 'text-neutral-600'}`}>
                      {getSenderName(m)}
                    </div>
                    <div className={`rounded-2xl px-4 py-2 shadow-sm ${m.sender_type === 'admin' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.message}</div>
                      <div className={`mt-1 text-[11px] ${m.sender_type === 'admin' ? 'text-indigo-100' : 'text-neutral-500'}`}>{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t p-3 sm:p-4 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={1}
                    placeholder={chatEnded ? 'This chat has ended' : 'Type a reply…'}
                    className="flex-1 resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    disabled={chatEnded}
                  />
                  <button onClick={handleSend} className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60" disabled={!replyText.trim() || chatEnded}>Send</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full grid place-items-center text-neutral-600">Choose a conversation from the left.</div>
          )}
        </div>
      </div>

      {/* Mobile/tablet view */}
      <div className="lg:hidden">
        {!showChatOnMobile ? (
          <div className="h-[calc(100vh-96px)] flex flex-col">
            <HeaderBar title="Live Support Chat" />
            <div className="p-3 border-b flex items-center gap-2">
              <input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search by name or email"
                className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="p-3 overflow-y-auto">
              {filteredConversations.length === 0 && (
                <div className="text-sm text-neutral-600">No conversations found.</div>
              )}
              {filteredConversations.map(conv => (
                <ConversationCard
                  key={conv.ticket_id}
                  item={conv}
                  selected={conv.ticket_id === selectedTicketId}
                  onClick={() => {
                    setSelectedTicketId(conv.ticket_id);
                    setShowChatOnMobile(true);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-96px)] flex flex-col">
            <HeaderBar title="Active Chat" back={() => setShowChatOnMobile(false)} right={<CloseChatButton onClick={handleCloseChat} />} />
            <div className="flex-1 flex flex-col" onMouseDown={() => selectedTicketId && setAutoScrollByTicket(prev => ({ ...prev, [selectedTicketId]: false }))}>
              {/* Admin typing indicator */}
              {replyText && !chatEnded && (
                <div className="px-3 pt-2 text-xs text-neutral-500">You are typing…</div>
              )}
              {chatEnded && (
                <div className="px-3 pt-2 text-xs text-neutral-600">This chat has ended. Replies are disabled.</div>
              )}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeMessages.map(m => (
                  <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${m.sender_type === 'admin' ? 'ml-auto bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                    <div className="text-sm whitespace-pre-wrap break-words">{m.message}</div>
                    <div className={`mt-1 text-[11px] ${m.sender_type === 'admin' ? 'text-indigo-100' : 'text-neutral-500'}`}>{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t p-3 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={1}
                    placeholder={chatEnded ? 'This chat has ended' : 'Type a reply…'}
                    className="flex-1 resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    disabled={chatEnded}
                  />
                  <button onClick={handleSend} className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60" disabled={!replyText.trim() || chatEnded}>Send</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status prompt */}
      <StatusPromptModal open={showStatusPrompt} onClose={() => setShowStatusPrompt(false)} onApply={applyStatus} />
    </div>
  );
}
