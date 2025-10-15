import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SupabaseUser { id: string; email?: string | null }
interface User { id: string; email: string; full_name?: string | null }
interface Booking { id: string; user_id: string; service_name?: string; phone?: string; address?: string; status: string; amount?: number; created_at: string; tracking_stage?: string; pickup_option?: string; customer_name?: string; customer_email?: string; total_amount?: number; updated_at?: string; stage_timestamps?: { [key: string]: string } }
interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; status: string; created_at: string }
interface PickupDelivery { id: string; user_id: string; status: string; created_at: string }
interface Complaint { id: string; user_id: string; subject: string; status: string; created_at: string }
interface Payment { id: string; user_id: string; amount: number; status: string; created_at: string }
interface Subscription { id: string; user_id: string; plan_name?: string; amount: number; status: string; created_at: string }
interface LaundryOrder { id: string; user_id: string; items?: number; amount?: number; status: string; created_at: string }
interface AdminNotification { id: string; title: string; message: string; status: string; created_at: string }
interface Review { id: string; user_id: string; rating: number; comment?: string; created_at: string }
interface SupportTicket { id: string; user_id: string; ticket_number: string; subject: string; description: string; status: "open" | "in_progress" | "resolved" | "closed"; priority: "low" | "normal" | "high" | "urgent"; created_at: string; updated_at: string }
interface SupportMessage { id: string; ticket_id: string; sender_id: string; sender_type: "user" | "admin"; message: string; message_type: "text" | "image" | "file"; is_read: boolean; created_at: string }

type AppState = {
  users: User[];
  bookings: Booking[];
  contactMessages: ContactMessage[];
  pickupDeliveries: PickupDelivery[];
  userComplaints: Complaint[];
  payments: Payment[];
  subscriptions: Subscription[];
  laundryOrders: LaundryOrder[];
  adminNotifications: AdminNotification[];
  reviews: Review[];
  supportTickets: SupportTicket[];
  supportMessages: SupportMessage[];
  authUser: SupabaseUser | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  realTimeConnected: boolean;
  stats: { 
    totalBookings: number; 
    totalRevenue: number; 
    activeUsers: number; 
    pendingBookings: number; 
    completedBookings: number; 
    todayBookings: number;
    activeSubscriptions: number;
    pendingOrders: number;
    unreadNotifications: number;
    averageRating: number;
    pendingReviews: number;
  };
};

type Action =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'SET_CONTACT_MESSAGES'; payload: ContactMessage[] }
  | { type: 'SET_PICKUP_DELIVERIES'; payload: PickupDelivery[] }
  | { type: 'SET_USER_COMPLAINTS'; payload: Complaint[] }
  | { type: 'SET_PAYMENTS'; payload: Payment[] }
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'SET_LAUNDRY_ORDERS'; payload: LaundryOrder[] }
  | { type: 'SET_ADMIN_NOTIFICATIONS'; payload: AdminNotification[] }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'SET_SUPPORT_TICKETS'; payload: SupportTicket[] }
  | { type: 'SET_SUPPORT_MESSAGES'; payload: SupportMessage[] }
  | { type: 'SET_AUTH_USER'; payload: SupabaseUser | null }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REALTIME_CONNECTED'; payload: boolean };

const initialState: AppState = {
  users: [],
  bookings: [],
  contactMessages: [],
  pickupDeliveries: [],
  userComplaints: [],
  payments: [],
  subscriptions: [],
  laundryOrders: [],
  adminNotifications: [],
  reviews: [],
  supportTickets: [],
  supportMessages: [],
  authUser: null,
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  realTimeConnected: false,
  stats: { 
    totalBookings: 0, 
    totalRevenue: 0, 
    activeUsers: 0, 
    pendingBookings: 0, 
    completedBookings: 0, 
    todayBookings: 0,
    activeSubscriptions: 0,
    pendingOrders: 0,
    unreadNotifications: 0,
    averageRating: 0,
    pendingReviews: 0,
  }
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USERS': return { ...state, users: action.payload };
    case 'SET_BOOKINGS': return { ...state, bookings: action.payload };
    case 'SET_CONTACT_MESSAGES': return { ...state, contactMessages: action.payload };
    case 'SET_PICKUP_DELIVERIES': return { ...state, pickupDeliveries: action.payload };
    case 'SET_USER_COMPLAINTS': return { ...state, userComplaints: action.payload };
    case 'SET_PAYMENTS': return { ...state, payments: action.payload };
    case 'SET_SUBSCRIPTIONS': return { ...state, subscriptions: action.payload };
    case 'SET_LAUNDRY_ORDERS': return { ...state, laundryOrders: action.payload };
    case 'SET_ADMIN_NOTIFICATIONS': return { ...state, adminNotifications: action.payload };
    case 'SET_REVIEWS': return { ...state, reviews: action.payload };
    case 'SET_SUPPORT_TICKETS': return { ...state, supportTickets: action.payload };
    case 'SET_SUPPORT_MESSAGES': return { ...state, supportMessages: action.payload };
    case 'SET_AUTH_USER': return { ...state, authUser: action.payload, isAuthenticated: !!action.payload };
    case 'SET_CURRENT_USER': return { ...state, currentUser: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_REALTIME_CONNECTED': return { ...state, realTimeConnected: action.payload };
    default: return state;
  }
}

const SupabaseDataContext = createContext<any>(null);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        dispatch({ type: 'SET_AUTH_USER', payload: session?.user || null });
        if (session?.user?.id) {
          const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (user) dispatch({ type: 'SET_CURRENT_USER', payload: user });
        }
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: e.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  // Realtime + probe to set live connectivity state
  useEffect(() => {
    let mounted = true;
    try {
      const channel = supabase
        .channel('admin-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {})
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
          if (mounted) fetchSupportTickets();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
          if (mounted) fetchSupportMessages();
        })
        .subscribe((status) => {
          if (!mounted) return;
          if (status === 'SUBSCRIBED') {
            dispatch({ type: 'SET_REALTIME_CONNECTED', payload: true });
          }
        });

      (async () => {
        try {
          const { error } = await supabase
            .from('bookings')
            .select('id', { head: true, count: 'exact' });
          if (!error) dispatch({ type: 'SET_REALTIME_CONNECTED', payload: true });
        } catch {
          // keep offline if probe fails
        }
      })();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
        dispatch({ type: 'SET_REALTIME_CONNECTED', payload: false });
      };
    } catch {
      // keep offline if client fails to init
    }
  }, []);

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_USERS', payload: data || [] });
  };
  const fetchAllBookings = async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_BOOKINGS', payload: data || [] });
  };
  const fetchContactMessages = async () => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_CONTACT_MESSAGES', payload: data || [] });
  };
  const fetchPickupDeliveries = async () => {
    const { data, error } = await supabase.from('pickup_deliveries').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_PICKUP_DELIVERIES', payload: data || [] });
  };
  const fetchUserComplaints = async () => {
    const { data, error } = await supabase.from('user_complaints').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_USER_COMPLAINTS', payload: data || [] });
  };

  // Additional admin fetchers
  const fetchPayments = async () => {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_PAYMENTS', payload: data || [] });
  };
  const fetchSubscriptions = async () => {
    const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_SUBSCRIPTIONS', payload: data || [] });
  };
  const fetchLaundryOrders = async () => {
    const { data, error } = await supabase.from('laundry_orders').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_LAUNDRY_ORDERS', payload: data || [] });
  };
  const fetchAdminNotifications = async () => {
    const { data, error } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_ADMIN_NOTIFICATIONS', payload: data || [] });
  };
  const fetchReviews = async () => {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_REVIEWS', payload: data || [] });
  };
  const fetchSupportTickets = async () => {
    const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_SUPPORT_TICKETS', payload: data || [] });
  };
  const fetchSupportMessages = async () => {
    const { data, error } = await supabase.from('support_messages').select('*').order('created_at', { ascending: false });
    if (!error) dispatch({ type: 'SET_SUPPORT_MESSAGES', payload: data || [] });
  };

  // Admin mutations
  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SET_AUTH_USER', payload: null });
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const updateBooking = async (id: string, updates: any) => {
    const { error } = await supabase.from('bookings').update(updates).eq('id', id);
    if (!error) await fetchAllBookings();
  };
  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) await fetchAllBookings();
  };

  const updateUser = async (id: string, updates: any) => {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (!error) await fetchAllUsers();
  };
  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) await fetchAllUsers();
  };

  const updateContactMessage = async (id: string, updates: any) => {
    const { error } = await supabase.from('contact_messages').update(updates).eq('id', id);
    if (!error) await fetchContactMessages();
  };

  const createPickupDelivery = async (payload: any) => {
    const { error } = await supabase.from('pickup_deliveries').insert(payload);
    if (!error) await fetchPickupDeliveries();
  };
  const updatePickupDelivery = async (id: string, updates: any) => {
    const { error } = await supabase.from('pickup_deliveries').update(updates).eq('id', id);
    if (!error) await fetchPickupDeliveries();
  };

  const createUserComplaint = async (payload: any) => {
    const { error } = await supabase.from('user_complaints').insert(payload);
    if (!error) await fetchUserComplaints();
  };
  const updateUserComplaint = async (id: string, updates: any) => {
    const { error } = await supabase.from('user_complaints').update(updates).eq('id', id);
    if (!error) await fetchUserComplaints();
  };

  const updateAdminNotification = async (id: string, updates: any) => {
    const { error } = await supabase.from('admin_notifications').update(updates).eq('id', id);
    if (!error) await fetchAdminNotifications();
  };
  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase.from('admin_notifications').update({ status: 'read' }).eq('id', id);
    if (!error) await fetchAdminNotifications();
  };

  // Support ticket management
  const updateSupportTicket = async (id: string, updates: any) => {
    const { error } = await supabase.from('support_tickets').update(updates).eq('id', id);
    if (!error) await fetchSupportTickets();
  };
  const sendSupportMessage = async (payload: any) => {
    const { error } = await supabase.from('support_messages').insert(payload);
    if (!error) await fetchSupportMessages();
  };
  const markMessageAsRead = async (id: string) => {
    const { error } = await supabase.from('support_messages').update({ is_read: true }).eq('id', id);
    if (!error) await fetchSupportMessages();
  };

  const value = {
    state,
    dispatch,
    fetchAllUsers,
    fetchAllBookings,
    fetchContactMessages,
    fetchPickupDeliveries,
    fetchUserComplaints,
    fetchPayments,
    fetchSubscriptions,
    fetchLaundryOrders,
    fetchAdminNotifications,
    fetchReviews,
    fetchSupportTickets,
    fetchSupportMessages,
    signOut,
    updateBooking,
    deleteBooking,
    updateUser,
    deleteUser,
    updateContactMessage,
    createPickupDelivery,
    updatePickupDelivery,
    createUserComplaint,
    updateUserComplaint,
    updateAdminNotification,
    markNotificationAsRead,
    updateSupportTicket,
    sendSupportMessage,
    markMessageAsRead,
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  )
}

export function useSupabaseData() {
  const ctx = useContext(SupabaseDataContext);
  if (!ctx) throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  return ctx;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}