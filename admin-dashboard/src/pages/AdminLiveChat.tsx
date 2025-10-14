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
      .channel("admin-live-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload: any) => {
          const msg = payload.new as SupportMessage;
          setMessages((prev) => [...prev, msg]);
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="space-y-2 max-h-[420px] overflow-auto">
            {filteredTickets.map((t) => (
              <button
                key={t.id}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedTicketId === t.id ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedTicketId(t.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.subject}</span>
                  <span className="text-xs text-gray-500">{t.ticket_number}</span>
                </div>
                <div className="text-xs text-gray-500">{t.status} • {t.priority}</div>
              </button>
            ))}
            {filteredTickets.length === 0 && (
              <div className="text-sm text-gray-500">No tickets found.</div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow border flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Conversation</h3>
          </div>
          <div ref={listRef} className="flex-1 p-4 space-y-3 overflow-auto max-h-[520px]">
            {ticketMessages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] p-3 rounded-xl ${
                  m.sender_type === "admin" ? "bg-purple-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}>
                  <div className="text-sm">{m.message}</div>
                  <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {!selectedTicketId && (
              <div className="text-center text-gray-500">Select a ticket to view messages</div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
      {loading && <div className="text-sm text-gray-500 mt-2">Loading…</div>}
    </div>
  );
}
