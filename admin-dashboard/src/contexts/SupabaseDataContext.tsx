import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SupabaseUser { id: string; email?: string | null }
interface User { id: string; email?: string | null; full_name?: string | null; phone?: string; created_at?: string }
interface CustomerWithStats extends User {
  totalSpent: number;
  totalBookings: number;
  status: string;
}
interface Booking { 
  id: string; 
  user_id: string; 
  service_name?: string; 
  service_type?: string;
  date?: string;
  time?: string;
  phone?: string; 
  address?: string; 
  special_instructions?: string;
  status: string; 
  total_amount?: number; 
  created_at: string; 
  updated_at?: string;
  tracking_stage: string; 
  pickup_option?: string; 
  stage_timestamps?: { [key: string]: string };
  stage_notes?: { [key: string]: string };
  tracking_history?: any[];
  users?: {
    id: string;
    email: string;
    full_name: string;
  };
  // Computed properties for backward compatibility
  customer_name?: string;
  customer_email?: string;
  // Additional properties used in AdminDashboard
  userName?: string;
  userEmail?: string;
  service?: string;
  amount?: number;
}
interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; status: "new" | "in_progress" | "resolved"; created_at: string }
interface PickupDelivery { 
  id: string; 
  user_id: string; 
  status: string; 
  created_at: string;
  type?: string;
  actual_date?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  customerName?: string;
  customerEmail?: string;
  serviceName?: string;
  pickup_address?: string;
  delivery_address?: string;
  driver_name?: string;
  driver_phone?: string;
}
interface Complaint { 
  id: string; 
  user_id: string; 
  subject: string; 
  status: string; 
  created_at: string;
  customerName?: string;
  customerEmail?: string;
  complaint_type?: string;
  priority?: string;
}
interface Payment { id: string; user_id: string; amount: number; status: string; created_at: string }
interface Subscription { 
  id: string; 
  user_id: string; 
  plan_name?: string; 
  amount: number; 
  status: string; 
  created_at: string;
  next_billing_date?: string;
  customerName?: string;
  customerEmail?: string;
  billing_cycle?: string;
}
interface LaundryOrder { 
  id: string; 
  user_id: string; 
  items?: number; 
  amount?: number; 
  status: string; 
  created_at: string;
  updated_at?: string;
  total_amount?: number;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  service_type?: string;
  item_count?: number;
}
interface AdminNotification { 
  id: string; 
  title: string; 
  message: string; 
  status: string; 
  created_at: string;
  type?: string;
  priority?: string;
}
interface Review { 
  id: string; 
  user_id: string; 
  rating: number; 
  comment?: string; 
  created_at: string;
  customerName?: string;
  status?: string;
  serviceName?: string;
}
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

// Helper function to calculate stats from current state
function calculateStats(state: AppState): AppState['stats'] {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    totalBookings: state.bookings.length,
    totalRevenue: state.bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0),
    activeUsers: state.users.length,
    pendingBookings: state.bookings.filter(booking => booking.status === 'pending').length,
    completedBookings: state.bookings.filter(booking => booking.status === 'completed').length,
    todayBookings: state.bookings.filter(booking => booking.date === today).length,
    activeSubscriptions: state.subscriptions.filter(sub => sub.status === 'active').length,
    pendingOrders: state.laundryOrders.filter(order => order.status === 'pending').length,
    unreadNotifications: state.adminNotifications.filter(notif => notif.status === 'unread').length,
    averageRating: state.reviews.length > 0 
      ? state.reviews.reduce((sum, review) => sum + review.rating, 0) / state.reviews.length 
      : 0,
    pendingReviews: state.reviews.filter(review => review.status === 'pending').length,
  };
}

function reducer(state: AppState, action: Action): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'SET_USERS': 
      newState = { ...state, users: action.payload };
      break;
    case 'SET_BOOKINGS': 
      newState = { ...state, bookings: action.payload };
      break;
    case 'SET_CONTACT_MESSAGES': 
      newState = { ...state, contactMessages: action.payload };
      break;
    case 'SET_PICKUP_DELIVERIES': 
      newState = { ...state, pickupDeliveries: action.payload };
      break;
    case 'SET_USER_COMPLAINTS': 
      newState = { ...state, userComplaints: action.payload };
      break;
    case 'SET_PAYMENTS': 
      newState = { ...state, payments: action.payload };
      break;
    case 'SET_SUBSCRIPTIONS': 
      newState = { ...state, subscriptions: action.payload };
      break;
    case 'SET_LAUNDRY_ORDERS': 
      newState = { ...state, laundryOrders: action.payload };
      break;
    case 'SET_ADMIN_NOTIFICATIONS': 
      newState = { ...state, adminNotifications: action.payload };
      break;
    case 'SET_REVIEWS': 
      newState = { ...state, reviews: action.payload };
      break;
    case 'SET_SUPPORT_TICKETS': 
      newState = { ...state, supportTickets: action.payload };
      break;
    case 'SET_SUPPORT_MESSAGES': 
      newState = { ...state, supportMessages: action.payload };
      break;
    case 'SET_AUTH_USER': 
      return { ...state, authUser: action.payload, isAuthenticated: !!action.payload };
    case 'SET_CURRENT_USER': 
      return { ...state, currentUser: action.payload };
    case 'SET_LOADING': 
      return { ...state, loading: action.payload };
    case 'SET_ERROR': 
      return { ...state, error: action.payload };
    case 'SET_REALTIME_CONNECTED': 
      return { ...state, realTimeConnected: action.payload };
    default: 
      return state;
  }
  
  // Recalculate stats for data-related actions
  newState.stats = calculateStats(newState);
  return newState;
}

interface SupabaseDataContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  fetchAllUsers: () => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  fetchContactMessages: () => Promise<void>;
  fetchPickupDeliveries: () => Promise<void>;
  fetchUserComplaints: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  fetchLaundryOrders: () => Promise<void>;
  fetchAdminNotifications: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  fetchSupportTickets: () => Promise<void>;
  fetchSupportMessages: () => Promise<void>;
  signOut: () => Promise<void>;
  updateBooking: (id: string, updates: any) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateUser: (id: string, updates: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateContactMessage: (id: string, updates: any) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  createPickupDelivery: (payload: any) => Promise<void>;
  updatePickupDelivery: (id: string, updates: any) => Promise<void>;
  createUserComplaint: (payload: any) => Promise<void>;
  updateUserComplaint: (id: string, updates: any) => Promise<void>;
  updateAdminNotification: (id: string, updates: any) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  updateSupportTicket: (id: string, updates: any) => Promise<void>;
  sendSupportMessage: (payload: any) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | null>(null);

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
  const fetchAllBookings = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase configuration missing');
        console.error('Missing environment variables:', {
          VITE_SUPABASE_URL: !!supabaseUrl,
          VITE_SUPABASE_ANON_KEY: !!supabaseKey
        });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch orders: Supabase configuration missing. Please check environment variables.' });
        return;
      }
      
      console.log(`🔍 Fetching bookings from database... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching bookings:', error);
        
        // Check if it's a network error and we can retry
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: fetch failed')) {
          if (retryCount < maxRetries) {
            console.log(`⏳ Network error detected, retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => fetchAllBookings(retryCount + 1), 2000);
            return;
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Network connection issue. Please check your internet connection and try refreshing the page.' });
            return;
          }
        }
        
        dispatch({ type: 'SET_ERROR', payload: `Database error: ${error.message}` });
        return;
      }
      
      console.log('✅ Successfully fetched bookings:', data?.length || 0, 'records');
      
      // Add computed properties for backward compatibility
      const bookingsWithCustomerInfo = (data || []).map(booking => {
        // Better fallback logic for customer name
        let customerName = booking.users?.full_name;
        if (!customerName) {
          if (booking.users?.email) {
            // Use email username if no full name
            customerName = booking.users.email.split('@')[0];
          } else if (booking.phone) {
            // Use phone number if no email
            customerName = `Customer ${booking.phone}`;
          } else {
            // Last resort - use order ID
            customerName = `Customer #${booking.id.slice(-6).toUpperCase()}`;
          }
        }

        return {
          ...booking,
          customer_name: customerName,
          customer_email: booking.users?.email || booking.phone || 'No contact info',
          // Ensure tracking_stage exists
          tracking_stage: booking.tracking_stage || 'sorting'
        };
      });
      
      dispatch({ type: 'SET_BOOKINGS', payload: bookingsWithCustomerInfo });
      dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors
    } catch (error) {
      console.error('❌ Unexpected error fetching bookings:', error);
      
      // Check if it's a network error and we can retry
      if ((error instanceof TypeError && error.message.includes('fetch failed')) || 
          error.message.includes('Failed to fetch')) {
        if (retryCount < maxRetries) {
          console.log(`⏳ Network error detected, retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => fetchAllBookings(retryCount + 1), 2000);
          return;
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Network connection issue. Please check your internet connection and try refreshing the page.' });
          return;
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch orders: Unexpected error occurred' });
    }
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
  const deleteContactMessage = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
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
    deleteContactMessage,
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

export function useSupabaseData(): SupabaseDataContextType {
  const ctx = useContext(SupabaseDataContext);
  if (!ctx) throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  return ctx;
}