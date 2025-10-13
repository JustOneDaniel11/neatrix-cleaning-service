import React, { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useRealtimeData } from '../hooks/useRealtimeData';

interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminLiveChat() {
  const { data: rtTickets } = useRealtimeData<SupportTicket>('support_tickets', '*');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const { data: rtMessages } = useRealtimeData<SupportMessage>('support_messages', '*',
    selectedTicketId ? { column: 'ticket_id', value: selectedTicketId } : undefined
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [rtMessages, selectedTicketId]);

  const filteredTickets = (rtTickets || []).filter(t =>
    (t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_number?.toLowerCase().includes(search.toLowerCase()))
  );
  const ticketMessages = rtMessages || [];

  const sendMessage = async () => {
    if (!isSupabaseConfigured || !selectedTicketId || !input.trim()) return;
    const newMsg = {
      ticket_id: selectedTicketId,
      // Store the original user id for relational linking; admin indicated by sender_type
      sender_id: (rtTickets || []).find(t => t.id === selectedTicketId)?.user_id || '',
      sender_type: 'admin' as const,
      message: input.trim(),
      message_type: 'text' as const,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('support_messages')
      .insert([newMsg])
      .select()
      .single();
    if (!error && data) {
      // realtime subscription will update UI
      setInput('');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow border p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-5 h-5 text-purple-600">💬</span>
            <h2 className="font-semibold">Support Tickets</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-4 h-4 text-gray-500">🔎</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="space-y-2 max-h-[420px] overflow-auto">
            {filteredTickets.map(t => (
              <button
                key={t.id}
                className={`w-full text-left p-3 rounded-lg border ${selectedTicketId === t.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}
                onClick={() => setSelectedTicketId(t.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.subject}</span>
                  <span className="text-xs text-gray-500">{t.ticket_number}</span>
                </div>
                <div className="text-xs text-gray-500">{t.status} • {t.priority}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow border flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Conversation</h3>
          </div>
          <div ref={listRef} className="flex-1 p-4 space-y-3 overflow-auto max-h-[520px]">
            {ticketMessages.map(m => {
              const isAdmin = m.sender_type === 'admin';
              return (
                <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} items-end`}>
                  {!isAdmin && (
                    <div className="mr-2 flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">U</div>
                    </div>
                  )}
                  <div className={`relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${isAdmin ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                    <div className="text-sm leading-relaxed break-words">{m.message}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[10px] ${isAdmin ? 'text-purple-100' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString()}</span>
                      {isAdmin && (
                        <span className="text-[10px] text-purple-100">✓</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700">A</div>
                    </div>
                  )}
                </div>
              );
            })}
            {!selectedTicketId && (
              <div className="text-center text-gray-500">Select a ticket to view messages</div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message"
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button onClick={sendMessage} className="px-4 py-2 rounded-lg bg-purple-600 text-white">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}