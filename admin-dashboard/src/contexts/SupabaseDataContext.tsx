import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface SupabaseUser { id: string; email?: string | null }
export interface User { id: string; email?: string | null; full_name?: string | null; phone?: string; created_at?: string }
interface CustomerWithStats extends User {
  totalSpent: number;
  totalBookings: number;
  status: string;
}
export interface Booking { 
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
  tracking_history?: Array<{
    stage: string;
    timestamp: string;
    notes?: string;
  }>;
  users?: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
  };
  // Computed properties for backward compatibility
  customer_name?: string;
  customer_email?: string;
  // Additional properties used in AdminDashboard
  userName?: string;
  userEmail?: string;
  service?: string;
  amount?: number;
  delivery_status?: string;
  customerName?: string;
  customerEmail?: string;
  // Index signature to allow additional properties
  [key: string]: unknown;
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
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  base_price: number;
  billing_cycle: 'weekly' | 'bi_weekly' | 'monthly' | 'custom';
  features: string[];
  max_services_per_cycle: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  next_billing_date: string;
  auto_renew: boolean;
  services_used_this_cycle: number;
  current_cycle_start: string;
  current_cycle_end: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
  customerName?: string;
  customerEmail?: string;
}

interface SubscriptionBilling {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  billing_date: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionCustomization {
  id: string;
  subscription_id: string;
  user_id: string;
  custom_frequency_days?: number;
  preferred_service_days: string[];
  special_instructions?: string;
  preferred_cleaner_id?: string;
  custom_pricing?: number;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility
export interface Subscription { 
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
  customer_email?: string;
  customer_phone?: string;
  frequency?: string;
  customer_name?: string;
  // Index signature to allow additional properties
  [key: string]: unknown;
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
  customer_email?: string;
  service_type?: string;
  service_name?: string;
  item_count?: number;
  date?: string;
  time?: string;
  address?: string;
  special_instructions?: string;
  tracking_stage?: string;
  pickup_option?: string;
  stage_timestamps?: { [key: string]: string };
  stage_notes?: { [key: string]: string };
  tracking_history?: Array<{
    stage: string;
    timestamp: string;
    notes?: string;
  }>;
}
export interface AdminNotification { 
  id: string; 
  title: string; 
  message: string; 
  status: string; 
  created_at: string;
  type?: string;
  priority?: string;
  action_url?: string;
  action_label?: string;
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
  subscriptions: Subscription[]; // Legacy
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  subscriptionBilling: SubscriptionBilling[];
  subscriptionCustomizations: SubscriptionCustomization[];
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
  | { type: 'SET_SUBSCRIPTION_PLANS'; payload: SubscriptionPlan[] }
  | { type: 'SET_USER_SUBSCRIPTIONS'; payload: UserSubscription[] }
  | { type: 'ADD_USER_SUBSCRIPTION'; payload: UserSubscription }
  | { type: 'UPDATE_USER_SUBSCRIPTION'; payload: { id: string; updates: Partial<UserSubscription> } }
  | { type: 'DELETE_USER_SUBSCRIPTION'; payload: string }
  | { type: 'SET_SUBSCRIPTION_BILLING'; payload: SubscriptionBilling[] }
  | { type: 'ADD_SUBSCRIPTION_BILLING'; payload: SubscriptionBilling }
  | { type: 'SET_SUBSCRIPTION_CUSTOMIZATIONS'; payload: SubscriptionCustomization[] }
  | { type: 'ADD_SUBSCRIPTION_CUSTOMIZATION'; payload: SubscriptionCustomization }
  | { type: 'UPDATE_SUBSCRIPTION_CUSTOMIZATION'; payload: { id: string; updates: Partial<SubscriptionCustomization> } }
  | { type: 'SET_LAUNDRY_ORDERS'; payload: LaundryOrder[] }
  | { type: 'SET_ADMIN_NOTIFICATIONS'; payload: AdminNotification[] }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'SET_SUPPORT_TICKETS'; payload: SupportTicket[] }
  | { type: 'SET_SUPPORT_MESSAGES'; payload: SupportMessage[] }
  | { type: 'ADD_SUPPORT_MESSAGE'; payload: SupportMessage }
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
  subscriptionPlans: [],
  userSubscriptions: [],
  subscriptionBilling: [],
  subscriptionCustomizations: [],
  laundryOrders: [],
  adminNotifications: [],
  reviews: [],
  supportTickets: [],
  supportMessages: [],
  authUser: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to check session
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
  
  // Calculate total revenue from both regular bookings and laundry orders
  const bookingsRevenue = state.bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
  const laundryRevenue = state.laundryOrders.reduce((sum, order) => sum + (order.total_amount || order.amount || 0), 0);
  
  return {
    totalBookings: state.bookings.length,
    totalRevenue: bookingsRevenue + laundryRevenue,
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
    case 'SET_SUBSCRIPTION_PLANS':
      newState = { ...state, subscriptionPlans: action.payload };
      break;
    case 'SET_USER_SUBSCRIPTIONS':
      newState = { ...state, userSubscriptions: action.payload };
      break;
    case 'ADD_USER_SUBSCRIPTION':
      newState = { ...state, userSubscriptions: [...state.userSubscriptions, action.payload] };
      break;
    case 'UPDATE_USER_SUBSCRIPTION':
      newState = {
        ...state,
        userSubscriptions: state.userSubscriptions.map(sub =>
          sub.id === action.payload.id ? { ...sub, ...action.payload.updates } : sub
        )
      };
      break;
    case 'DELETE_USER_SUBSCRIPTION':
      newState = {
        ...state,
        userSubscriptions: state.userSubscriptions.filter(sub => sub.id !== action.payload)
      };
      break;
    case 'SET_SUBSCRIPTION_BILLING':
      newState = { ...state, subscriptionBilling: action.payload };
      break;
    case 'ADD_SUBSCRIPTION_BILLING':
      newState = { ...state, subscriptionBilling: [...state.subscriptionBilling, action.payload] };
      break;
    case 'SET_SUBSCRIPTION_CUSTOMIZATIONS':
      newState = { ...state, subscriptionCustomizations: action.payload };
      break;
    case 'ADD_SUBSCRIPTION_CUSTOMIZATION':
      newState = { ...state, subscriptionCustomizations: [...state.subscriptionCustomizations, action.payload] };
      break;
    case 'UPDATE_SUBSCRIPTION_CUSTOMIZATION':
      newState = {
        ...state,
        subscriptionCustomizations: state.subscriptionCustomizations.map(custom =>
          custom.id === action.payload.id ? { ...custom, ...action.payload.updates } : custom
        )
      };
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
    case 'ADD_SUPPORT_MESSAGE':
      newState = { ...state, supportMessages: [...state.supportMessages, action.payload] };
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
  fetchSubscriptionPlans: () => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  fetchSubscriptionBilling: () => Promise<void>;
  fetchSubscriptionCustomizations: () => Promise<void>;
  updateUserSubscription: (id: string, updates: Partial<UserSubscription>) => Promise<void>;
  cancelUserSubscription: (id: string) => Promise<void>;
  pauseUserSubscription: (id: string) => Promise<void>;
  resumeUserSubscription: (id: string) => Promise<void>;
  createSubscriptionBilling: (payload: Omit<SubscriptionBilling, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  fetchLaundryOrders: () => Promise<void>;
  fetchAdminNotifications: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  fetchSupportTickets: () => Promise<void>;
  fetchSupportMessages: () => Promise<void>;
  signOut: () => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  createPickupDelivery: (payload: Omit<PickupDelivery, 'id' | 'created_at'>) => Promise<void>;
  updatePickupDelivery: (id: string, updates: Partial<PickupDelivery>) => Promise<void>;
  createUserComplaint: (payload: Omit<Complaint, 'id' | 'created_at'>) => Promise<void>;
  updateUserComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  updateAdminNotification: (id: string, updates: Partial<AdminNotification>) => Promise<void>;
  deleteAdminNotification: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  createAdminNotification: (payload: { title: string; message: string; type?: string; priority?: string; action_url?: string; action_label?: string }) => Promise<void>;
  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => Promise<void>;
  sendSupportMessage: (payload: Omit<SupportMessage, 'id' | 'created_at'>) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | null>(null);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceTimers = useRef<Record<string, number>>({});
  const debounceInProgress = useRef<Record<string, boolean>>({});
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initializingRef = useRef(false);
  const usersAbortControllerRef = useRef<AbortController | null>(null);
  const bookingsAbortControllerRef = useRef<AbortController | null>(null);
  const contactMessagesAbortControllerRef = useRef<AbortController | null>(null);
  const pickupDeliveriesAbortControllerRef = useRef<AbortController | null>(null);
  const userComplaintsAbortControllerRef = useRef<AbortController | null>(null);
  const paymentsAbortControllerRef = useRef<AbortController | null>(null);
  const subscriptionsAbortControllerRef = useRef<AbortController | null>(null);
  const subscriptionPlansAbortControllerRef = useRef<AbortController | null>(null);
  const userSubscriptionsAbortControllerRef = useRef<AbortController | null>(null);
  const subscriptionBillingAbortControllerRef = useRef<AbortController | null>(null);
  const subscriptionCustomizationsAbortControllerRef = useRef<AbortController | null>(null);
  const laundryOrdersAbortControllerRef = useRef<AbortController | null>(null);
  const adminNotificationsAbortControllerRef = useRef<AbortController | null>(null);
  const reviewsAbortControllerRef = useRef<AbortController | null>(null);
  const supportTicketsAbortControllerRef = useRef<AbortController | null>(null);
  const supportMessagesAbortControllerRef = useRef<AbortController | null>(null);
  
  const debounceFetch = (
    key: string,
    fn: () => Promise<void>,
    delay = 1000 // Increased delay to reduce API calls
  ) => {
    // Clear any existing timer for this key
    const prev = debounceTimers.current[key];
    if (prev) {
      window.clearTimeout(prev);
      delete debounceTimers.current[key];
    }
    
    // Check if a request is already in progress
    if (debounceInProgress.current[key]) {
      console.log(`⚠️ Skipping ${key} fetch - request already in progress`);
      return;
    }
    
    debounceTimers.current[key] = window.setTimeout(async () => {
      // Remove the timer reference
      delete debounceTimers.current[key];
      
      // Set in-progress flag
      debounceInProgress.current[key] = true;
      
      try {
        await fn();
      } catch (error) {
        console.error(`Error in debounced fetch for ${key}:`, error);
      } finally {
        // Clear in-progress flag
        delete debounceInProgress.current[key];
      }
    }, delay);
  };

  // Initialize auth state and session persistence
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Prevent duplicate initialization
      if (initializingRef.current) {
        console.log("🔄 Auth initialization already in progress...");
        return;
      }

      initializingRef.current = true;
      console.log("🔄 Starting auth initialization...");

      try {
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log("🔑 Found existing session:", session.user.id);
          if (mounted) {
            dispatch({ type: "SET_AUTH_USER", payload: session.user });
            
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.error("❌ Profile fetch error:", profileError);
              // Check if it's a transient AbortError that can be ignored
              if (profileError.message.includes('AbortError') || profileError.message.includes('signal is aborted')) {
                console.log('⚠️ Transient AbortError in initial profile fetch, ignoring...');
                // Don't set current user to null for AbortErrors
              } else {
                // Keep user authenticated even if profile fetch fails
                dispatch({ type: "SET_CURRENT_USER", payload: null });
              }
            } else if (profile) {
              console.log("👤 Loaded user profile:", profile.email);
              dispatch({ type: "SET_CURRENT_USER", payload: profile });
            }
          }
        } else {
          console.log("ℹ️ No existing session found");
          if (mounted) {
            dispatch({ type: "SET_AUTH_USER", payload: null });
            dispatch({ type: "SET_CURRENT_USER", payload: null });
          }
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          console.log("🔔 Auth state changed:", event, session?.user?.id);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              console.log("✅ User authenticated:", session.user.id);
              dispatch({ type: "SET_AUTH_USER", payload: session.user });
              
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                
                if (profileError) throw profileError;
                
                if (profile) {
                  console.log("👤 User profile loaded:", profile.email);
                  dispatch({ type: "SET_CURRENT_USER", payload: profile });
                }
              } catch (err) {
                console.error("❌ Profile fetch error:", err);
                // Check if it's a transient AbortError that can be ignored
                if (err instanceof Error && (err.message.includes('AbortError') || err.message.includes('signal is aborted'))) {
                  console.log('⚠️ Transient AbortError in profile fetch, ignoring...');
                  // Don't dispatch error for AbortErrors
                  return;
                } else {
                  dispatch({ type: "SET_ERROR", payload: "Failed to load user profile" });
                }
              }
            }
          } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            console.log("👋 User signed out");
            dispatch({ type: "SET_AUTH_USER", payload: null });
            dispatch({ type: "SET_CURRENT_USER", payload: null });
          }
        });

        if (mounted) {
          subscriptionRef.current = subscription;
        }

      } catch (err) {
        console.error("❌ Auth initialization error:", err);
        if (mounted) {
          if (err instanceof Error) {
            // Check if it's a transient AbortError that can be ignored
            if (err.message.includes('AbortError') || err.message.includes('signal is aborted')) {
              console.log('⚠️ Transient AbortError in auth initialization, ignoring...');
              // Don't dispatch error or reset auth state for AbortErrors
              return;
            } else {
              dispatch({ type: "SET_ERROR", payload: err.message });
            }
          }
          dispatch({ type: "SET_AUTH_USER", payload: null });
          dispatch({ type: "SET_CURRENT_USER", payload: null });
        }
      } finally {
        if (mounted) {
          console.log("✨ Auth initialization complete, setting loading to false");
          dispatch({ type: "SET_LOADING", payload: false });
          initializingRef.current = false;
        }
      }
    };

    // Start initialization
    initializeAuth();

    return () => {
      mounted = false;
      // Clean up subscription
      if (subscriptionRef.current) {
        console.log("🧹 Cleaning up auth subscription");
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // Clean up debounce timers
      Object.values(debounceTimers.current).forEach(timerId => {
        window.clearTimeout(timerId);
      });
      debounceTimers.current = {};
      // Reset initialization flag
      initializingRef.current = false;
    };
  }, []);



  // Realtime + probe to set live connectivity state
  useEffect(() => {
    let mounted = true;
    try {
      const channel = supabase
        .channel('admin-live')
        // Bookings changes
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, async (payload) => {
          if (mounted) {
            debounceFetch('bookings', fetchAllBookings);
            debounceFetch('laundry_orders', fetchLaundryOrders); // Also refresh laundry orders
            
            // Create admin notification for new booking
            try {
              const newBooking = payload.new as Booking;
              const isLaundryOrder = newBooking.service_type === 'laundry' || newBooking.service_type === 'dry_cleaning';
              
              await createAdminNotification({
                title: isLaundryOrder ? 'New Laundry Order' : 'New Booking Received',
                message: isLaundryOrder 
                  ? `New ${newBooking.service_type} order from ${newBooking.customer_name || 'customer'}`
                  : `New booking for ${newBooking.service_name || 'service'} from ${newBooking.customer_name || 'customer'}`,
                type: isLaundryOrder ? 'laundry' : 'booking',
                priority: 'medium',
                action_url: isLaundryOrder ? '/admin/laundry' : '/admin/orders'
              });
            } catch (error) {
              console.error('Failed to create booking notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, () => {
          if (mounted) {
            debounceFetch('bookings', fetchAllBookings);
            debounceFetch('laundry_orders', fetchLaundryOrders); // Also refresh laundry orders
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'bookings' }, () => {
          if (mounted) {
            debounceFetch('bookings', fetchAllBookings);
            debounceFetch('laundry_orders', fetchLaundryOrders); // Also refresh laundry orders
          }
        })
        // Support tickets
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, async (payload) => {
          if (mounted) {
            debounceFetch('support_tickets', fetchSupportTickets);
            
            // Create admin notification for new support ticket
            try {
              const newTicket = payload.new as SupportTicket;
              const priority = newTicket.priority === 'urgent' ? 'high' : newTicket.priority === 'high' ? 'high' : 'medium';
              await createAdminNotification({
                title: 'New Support Ticket',
                message: `New ${newTicket.priority || 'normal'} priority ticket: ${newTicket.subject || 'No subject'}`,
                type: 'support',
                priority: priority,
                action_url: '/admin/support'
              });
            } catch (error) {
              console.error('Failed to create support ticket notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets' }, () => {
          if (mounted) debounceFetch('support_tickets', fetchSupportTickets);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'support_tickets' }, () => {
          if (mounted) debounceFetch('support_tickets', fetchSupportTickets);
        })
        // Support messages
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
          if (mounted && payload.new) {
            // Immediate UI update for new messages
            dispatch({ type: 'ADD_SUPPORT_MESSAGE', payload: payload.new as SupportMessage });
            // Also trigger a debounced fetch to ensure consistency
            debounceFetch('support_messages', fetchSupportMessages);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_messages' }, () => {
          if (mounted) debounceFetch('support_messages', fetchSupportMessages);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'support_messages' }, () => {
          if (mounted) debounceFetch('support_messages', fetchSupportMessages);
        })
        // Laundry orders are now handled through bookings table real-time subscription
        // Admin notifications - only listen to external changes, not our own creates
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'admin_notifications' }, () => {
          if (mounted) debounceFetch('admin_notifications', fetchAdminNotifications);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'admin_notifications' }, () => {
          if (mounted) debounceFetch('admin_notifications', fetchAdminNotifications);
        })
        // Subscription plans
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscription_plans' }, () => {
          if (mounted) debounceFetch('subscription_plans', fetchSubscriptionPlans);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscription_plans' }, () => {
          if (mounted) debounceFetch('subscription_plans', fetchSubscriptionPlans);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'subscription_plans' }, () => {
          if (mounted) debounceFetch('subscription_plans', fetchSubscriptionPlans);
        })
        // User subscriptions
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_subscriptions' }, async (payload) => {
          if (mounted) {
            debounceFetch('user_subscriptions', fetchUserSubscriptions);
            
            // Create admin notification for new subscription
            try {
              const newSubscription = payload.new as UserSubscription;
              await createAdminNotification({
                title: 'New Subscription',
                message: `New subscription created for user ${newSubscription.user_id.slice(-6).toUpperCase()}`,
                type: 'subscription',
                priority: 'medium',
                action_url: '/admin/subscriptions'
              });
            } catch (error) {
              console.error('Failed to create subscription notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_subscriptions' }, async (payload) => {
          if (mounted) {
            debounceFetch('user_subscriptions', fetchUserSubscriptions);
            
            // Create admin notification for subscription status changes
            try {
              const updatedSubscription = payload.new as UserSubscription;
              const oldSubscription = payload.old as UserSubscription;
              
              if (oldSubscription.status !== updatedSubscription.status) {
                const statusMessages = {
                  'active': 'activated',
                  'paused': 'paused',
                  'cancelled': 'cancelled',
                  'expired': 'expired'
                };
                
                await createAdminNotification({
                  title: 'Subscription Status Changed',
                  message: `Subscription ${updatedSubscription.id.slice(-6).toUpperCase()} has been ${statusMessages[updatedSubscription.status] || 'updated'}`,
                  type: 'subscription',
                  priority: updatedSubscription.status === 'cancelled' ? 'medium' : 'low',
                  action_url: '/admin/subscriptions'
                });
              }
            } catch (error) {
              console.error('Failed to create subscription update notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'user_subscriptions' }, () => {
          if (mounted) debounceFetch('user_subscriptions', fetchUserSubscriptions);
        })
        // Subscription billing
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscription_billing' }, async (payload) => {
          if (mounted) {
            debounceFetch('subscription_billing', fetchSubscriptionBilling);
            
            // Create admin notification for new billing record
            try {
              const newBilling = payload.new as SubscriptionBilling;
              await createAdminNotification({
                title: 'New Subscription Billing',
                message: `New billing record created for subscription ${newBilling.subscription_id.slice(-6).toUpperCase()} - $${newBilling.amount}`,
                type: 'billing',
                priority: 'low',
                action_url: '/admin/subscriptions'
              });
            } catch (error) {
              console.error('Failed to create billing notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscription_billing' }, async (payload) => {
          if (mounted) {
            debounceFetch('subscription_billing', fetchSubscriptionBilling);
            
            // Create admin notification for billing status changes
            try {
              const updatedBilling = payload.new as SubscriptionBilling;
              const oldBilling = payload.old as SubscriptionBilling;
              
              if (oldBilling.status !== updatedBilling.status && updatedBilling.status === 'failed') {
                await createAdminNotification({
                  title: 'Payment Failed',
                  message: `Payment failed for subscription ${updatedBilling.subscription_id.slice(-6).toUpperCase()} - $${updatedBilling.amount}`,
                  type: 'billing',
                  priority: 'high',
                  action_url: '/admin/subscriptions'
                });
              }
            } catch (error) {
              console.error('Failed to create billing update notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'subscription_billing' }, () => {
          if (mounted) debounceFetch('subscription_billing', fetchSubscriptionBilling);
        })
        // Subscription customizations
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscription_customizations' }, () => {
          if (mounted) debounceFetch('subscription_customizations', fetchSubscriptionCustomizations);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscription_customizations' }, () => {
          if (mounted) debounceFetch('subscription_customizations', fetchSubscriptionCustomizations);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'subscription_customizations' }, () => {
          if (mounted) debounceFetch('subscription_customizations', fetchSubscriptionCustomizations);
        })
        // Contact messages
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, async (payload) => {
          if (mounted) {
            debounceFetch('contact_messages', fetchContactMessages);
            
            // Create admin notification for new contact message
            try {
              const newMessage = payload.new as ContactMessage;
              await createAdminNotification({
                title: 'New Contact Message',
                message: `New message from ${newMessage.name || 'customer'}: ${newMessage.subject || 'No subject'}`,
                type: 'contact',
                priority: 'medium',
                action_url: '/admin/contact-message'
              });
            } catch (error) {
              console.error('Failed to create contact message notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contact_messages' }, () => {
          if (mounted) debounceFetch('contact_messages', fetchContactMessages);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'contact_messages' }, () => {
          if (mounted) debounceFetch('contact_messages', fetchContactMessages);
        })
        // Pickup deliveries
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pickup_deliveries' }, () => {
          if (mounted) debounceFetch('pickup_deliveries', fetchPickupDeliveries);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pickup_deliveries' }, () => {
          if (mounted) debounceFetch('pickup_deliveries', fetchPickupDeliveries);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pickup_deliveries' }, () => {
          if (mounted) debounceFetch('pickup_deliveries', fetchPickupDeliveries);
        })
        // Reviews
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, async (payload) => {
          if (mounted) {
            debounceFetch('reviews', fetchReviews);
            
            // Create admin notification for new review
            try {
              const newReview = payload.new as Review;
              await createAdminNotification({
                title: 'New Review Submitted',
                message: `New ${newReview.rating}-star review from ${newReview.customerName || 'customer'}`,
                type: 'review',
                priority: newReview.rating <= 2 ? 'high' : 'medium',
                action_url: '/admin/reviews'
              });
            } catch (error) {
              console.error('Failed to create review notification:', error);
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reviews' }, () => {
          if (mounted) debounceFetch('reviews', fetchReviews);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reviews' }, () => {
          if (mounted) debounceFetch('reviews', fetchReviews);
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
        
        // Cleanup all AbortController references to prevent memory leaks
        if (usersAbortControllerRef.current) {
          usersAbortControllerRef.current.abort();
          usersAbortControllerRef.current = null;
        }
        if (bookingsAbortControllerRef.current) {
          bookingsAbortControllerRef.current.abort();
          bookingsAbortControllerRef.current = null;
        }
        if (contactMessagesAbortControllerRef.current) {
          contactMessagesAbortControllerRef.current.abort();
          contactMessagesAbortControllerRef.current = null;
        }
        if (pickupDeliveriesAbortControllerRef.current) {
          pickupDeliveriesAbortControllerRef.current.abort();
          pickupDeliveriesAbortControllerRef.current = null;
        }
        if (userComplaintsAbortControllerRef.current) {
          userComplaintsAbortControllerRef.current.abort();
          userComplaintsAbortControllerRef.current = null;
        }
        if (paymentsAbortControllerRef.current) {
          paymentsAbortControllerRef.current.abort();
          paymentsAbortControllerRef.current = null;
        }
        if (subscriptionsAbortControllerRef.current) {
          subscriptionsAbortControllerRef.current.abort();
          subscriptionsAbortControllerRef.current = null;
        }
        if (subscriptionPlansAbortControllerRef.current) {
          subscriptionPlansAbortControllerRef.current.abort();
          subscriptionPlansAbortControllerRef.current = null;
        }
        if (userSubscriptionsAbortControllerRef.current) {
          userSubscriptionsAbortControllerRef.current.abort();
          userSubscriptionsAbortControllerRef.current = null;
        }
        if (subscriptionBillingAbortControllerRef.current) {
          subscriptionBillingAbortControllerRef.current.abort();
          subscriptionBillingAbortControllerRef.current = null;
        }
        if (subscriptionCustomizationsAbortControllerRef.current) {
          subscriptionCustomizationsAbortControllerRef.current.abort();
          subscriptionCustomizationsAbortControllerRef.current = null;
        }
        if (laundryOrdersAbortControllerRef.current) {
          laundryOrdersAbortControllerRef.current.abort();
          laundryOrdersAbortControllerRef.current = null;
        }
        if (adminNotificationsAbortControllerRef.current) {
          adminNotificationsAbortControllerRef.current.abort();
          adminNotificationsAbortControllerRef.current = null;
        }
        if (reviewsAbortControllerRef.current) {
          reviewsAbortControllerRef.current.abort();
          reviewsAbortControllerRef.current = null;
        }
        if (supportTicketsAbortControllerRef.current) {
          supportTicketsAbortControllerRef.current.abort();
          supportTicketsAbortControllerRef.current = null;
        }
        if (supportMessagesAbortControllerRef.current) {
          supportMessagesAbortControllerRef.current.abort();
          supportMessagesAbortControllerRef.current = null;
        }
        
        // Clear debounce timers
        Object.keys(debounceTimers.current).forEach(key => {
          if (debounceTimers.current[key]) {
            window.clearTimeout(debounceTimers.current[key]);
            delete debounceTimers.current[key];
          }
        });
        
        // Clear in-progress flags
        Object.keys(debounceInProgress.current).forEach(key => {
          delete debounceInProgress.current[key];
        });
      };
    } catch {
      // keep offline if client fails to init
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllUsers = async () => {
    // Cancel any ongoing request
    if (usersAbortControllerRef.current) {
      usersAbortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    usersAbortControllerRef.current = new AbortController();
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(usersAbortControllerRef.current.signal);
      
      if (error) {
        // Check if it's a transient AbortError that can be ignored
        if (error.message.includes('AbortError') || error.message.includes('signal is aborted')) {
          console.log('⚠️ Transient AbortError detected in fetchAllUsers, ignoring...');
          return;
        }
        console.error('❌ Error fetching users:', error);
        dispatch({ type: 'SET_ERROR', payload: `Failed to load users: ${error.message}` });
        return;
      }
      
      dispatch({ type: 'SET_USERS', payload: data || [] });
    } catch (error: any) {
      // Check if it's a transient AbortError that can be ignored
      if (error.message?.includes('AbortError') || error.message?.includes('signal is aborted')) {
        console.log('⚠️ Transient AbortError detected in fetchAllUsers catch, ignoring...');
        return;
      }
      console.error('❌ Unexpected error in fetchAllUsers:', error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to load users: ${error.message}` });
    }
  };
  const fetchAllBookings = async (retryCount = 0) => {
    const maxRetries = 3;
    
    // Only cancel ongoing request if it's not the same retry attempt
    if (bookingsAbortControllerRef.current && retryCount === 0) {
      bookingsAbortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request only if needed
    if (!bookingsAbortControllerRef.current || bookingsAbortControllerRef.current.signal.aborted) {
      bookingsAbortControllerRef.current = new AbortController();
    }
    
    const signal = bookingsAbortControllerRef.current.signal;
    
    try {
      // Check if request was aborted before starting
      if (signal.aborted) {
        console.log('⚠️ Request aborted before starting');
        return;
      }
      
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
          users:user_id (
            id,
            email,
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .abortSignal(bookingsAbortControllerRef.current?.signal);
      
      if (error) {
        console.error('❌ Supabase error fetching bookings:', error);
        
        // Check if it's a transient AbortError that can be ignored
        if (error.message.includes('AbortError') || error.message.includes('signal is aborted')) {
          console.log('⚠️ Transient AbortError detected, ignoring...');
          return;
        }
        
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
        
        // Don't show AbortErrors to users as they're transient
        if (error.message.includes('AbortError') || error.message.includes('signal is aborted')) {
          console.log('⚠️ Transient AbortError in fetchAllBookings, ignoring...');
          return;
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
      
      // Check if it's a transient AbortError that can be ignored
      if (error instanceof Error && (error.message.includes('AbortError') || error.message.includes('signal is aborted'))) {
        console.log('⚠️ Transient AbortError detected, ignoring...');
        return;
      }
      
      // Check if it's a network error and we can retry
      if ((error instanceof TypeError && error.message.includes('fetch failed')) || 
          (error instanceof Error && error.message.includes('Failed to fetch'))) {
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
    try {
      // Cancel any ongoing request
      if (contactMessagesAbortControllerRef.current) {
        contactMessagesAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      contactMessagesAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(contactMessagesAbortControllerRef.current.signal);
        
      if (!error) dispatch({ type: 'SET_CONTACT_MESSAGES', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching contact messages:', error);
      }
    }
  };
  const fetchPickupDeliveries = async () => {
    try {
      // Cancel any ongoing request
      if (pickupDeliveriesAbortControllerRef.current) {
        pickupDeliveriesAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      pickupDeliveriesAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('pickup_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(pickupDeliveriesAbortControllerRef.current.signal);
        
      if (!error) dispatch({ type: 'SET_PICKUP_DELIVERIES', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching pickup deliveries:', error);
      }
    }
  };
  const fetchUserComplaints = async () => {
    try {
      // Cancel any ongoing request
      if (userComplaintsAbortControllerRef.current) {
        userComplaintsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      userComplaintsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('user_complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(userComplaintsAbortControllerRef.current.signal);
        
      if (!error) dispatch({ type: 'SET_USER_COMPLAINTS', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching user complaints:', error);
      }
    }
  };

  // Additional admin fetchers
  const fetchPayments = async () => {
    try {
      // Cancel any ongoing request
      if (paymentsAbortControllerRef.current) {
        paymentsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      paymentsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(paymentsAbortControllerRef.current.signal);
        
      if (!error) dispatch({ type: 'SET_PAYMENTS', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching payments:', error);
      }
    }
  };
  const fetchSubscriptions = async () => {
    try {
      // Cancel any ongoing request
      if (subscriptionsAbortControllerRef.current) {
        subscriptionsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      subscriptionsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(subscriptionsAbortControllerRef.current.signal);
      
      if (!error) dispatch({ type: 'SET_SUBSCRIPTIONS', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching subscriptions:', error);
      }
    }
  };

  // Enhanced subscription functions
  const fetchSubscriptionPlans = async () => {
    try {
      // Cancel any ongoing request
      if (subscriptionPlansAbortControllerRef.current) {
        subscriptionPlansAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      subscriptionPlansAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(subscriptionPlansAbortControllerRef.current.signal);
      
      if (!error) dispatch({ type: 'SET_SUBSCRIPTION_PLANS', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching subscription plans:', error);
      }
    }
  };

  const fetchUserSubscriptions = async () => {
    try {
      // Cancel any ongoing request
      if (userSubscriptionsAbortControllerRef.current) {
        userSubscriptionsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      userSubscriptionsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*),
          users:user_id(id, email, full_name)
        `)
        .order('created_at', { ascending: false })
        .abortSignal(userSubscriptionsAbortControllerRef.current.signal);
      
      if (!error) {
        const userSubscriptions = (data || []).map(sub => ({
          ...sub,
          customerName: sub.users?.full_name || `Customer #${sub.user_id.slice(-6).toUpperCase()}`,
          customerEmail: sub.users?.email
        }));
        dispatch({ type: 'SET_USER_SUBSCRIPTIONS', payload: userSubscriptions });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching user subscriptions:', error);
      }
    }
  };

  const fetchSubscriptionBilling = async () => {
    try {
      // Cancel any ongoing request
      if (subscriptionBillingAbortControllerRef.current) {
        subscriptionBillingAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      subscriptionBillingAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('subscription_billing')
        .select('*')
        .order('billing_date', { ascending: false })
        .abortSignal(subscriptionBillingAbortControllerRef.current.signal);
      
      if (!error) dispatch({ type: 'SET_SUBSCRIPTION_BILLING', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching subscription billing:', error);
      }
    }
  };

  const fetchSubscriptionCustomizations = async () => {
    try {
      // Cancel any ongoing request
      if (subscriptionCustomizationsAbortControllerRef.current) {
        subscriptionCustomizationsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      subscriptionCustomizationsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('subscription_customizations')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(subscriptionCustomizationsAbortControllerRef.current.signal);
      
      if (!error) dispatch({ type: 'SET_SUBSCRIPTION_CUSTOMIZATIONS', payload: data || [] });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching subscription customizations:', error);
      }
    }
  };

  // Subscription management functions
  const updateUserSubscription = async (id: string, updates: Partial<UserSubscription>) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      dispatch({ type: 'UPDATE_USER_SUBSCRIPTION', payload: { id, updates: data } });
      
      // Create admin notification for subscription update
      await createAdminNotification({
        title: 'Subscription Updated',
        message: `Subscription ${id.slice(-6).toUpperCase()} has been updated`,
        type: 'subscription',
        priority: 'low'
      });
    }
  };

  const cancelUserSubscription = async (id: string) => {
    const updates = {
      status: 'cancelled' as const,
      end_date: new Date().toISOString(),
      auto_renew: false,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      dispatch({ type: 'UPDATE_USER_SUBSCRIPTION', payload: { id, updates: data } });
      
      // Create admin notification for cancellation
      await createAdminNotification({
        title: 'Subscription Cancelled',
        message: `Subscription ${id.slice(-6).toUpperCase()} has been cancelled`,
        type: 'subscription',
        priority: 'medium'
      });
    }
  };

  const pauseUserSubscription = async (id: string) => {
    const updates = {
      status: 'paused' as const,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      dispatch({ type: 'UPDATE_USER_SUBSCRIPTION', payload: { id, updates: data } });
      
      // Create admin notification for pause
      await createAdminNotification({
        title: 'Subscription Paused',
        message: `Subscription ${id.slice(-6).toUpperCase()} has been paused`,
        type: 'subscription',
        priority: 'low'
      });
    }
  };

  const resumeUserSubscription = async (id: string) => {
    const updates = {
      status: 'active' as const,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      dispatch({ type: 'UPDATE_USER_SUBSCRIPTION', payload: { id, updates: data } });
      
      // Create admin notification for resume
      await createAdminNotification({
        title: 'Subscription Resumed',
        message: `Subscription ${id.slice(-6).toUpperCase()} has been resumed`,
        type: 'subscription',
        priority: 'low'
      });
    }
  };

  const createSubscriptionBilling = async (payload: Omit<SubscriptionBilling, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('subscription_billing')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (!error && data) {
      dispatch({ type: 'ADD_SUBSCRIPTION_BILLING', payload: data });
    }
  };
  const fetchLaundryOrders = async () => {
    try {
      // Cancel any ongoing request
      if (laundryOrdersAbortControllerRef.current) {
        laundryOrdersAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      laundryOrdersAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users:user_id (
            id,
            email,
            full_name
          )
        `)
        .in('service_type', ['laundry', 'dry_cleaning'])
        .order('created_at', { ascending: false })
        .abortSignal(laundryOrdersAbortControllerRef.current.signal);
      
      if (!error) {
        // Transform bookings data to match LaundryOrder interface
        const laundryOrders = (data || []).map(booking => ({
          id: booking.id,
          user_id: booking.user_id,
          status: booking.status,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          total_amount: booking.total_amount,
          service_type: booking.service_type,
          customer_name: booking.users?.full_name || `Customer #${booking.id.slice(-6).toUpperCase()}`,
          customer_phone: booking.phone,
          // Add additional fields from booking
          service_name: booking.service_name,
          date: booking.date,
          time: booking.time,
          address: booking.address,
          special_instructions: booking.special_instructions,
          tracking_stage: booking.tracking_stage,
          pickup_option: booking.pickup_option,
          stage_timestamps: booking.stage_timestamps,
          stage_notes: booking.stage_notes,
          tracking_history: booking.tracking_history,
          customer_email: booking.users?.email
        }));
        
        dispatch({ type: 'SET_LAUNDRY_ORDERS', payload: laundryOrders });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching laundry orders:', error);
      }
    }
  };
  const fetchAdminNotifications = async () => {
    try {
      // Cancel any ongoing request
      if (adminNotificationsAbortControllerRef.current) {
        adminNotificationsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      adminNotificationsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(adminNotificationsAbortControllerRef.current.signal);
      
      if (!error) {
        dispatch({ type: 'SET_ADMIN_NOTIFICATIONS', payload: data || [] });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching admin notifications:', error);
      }
    }
  };
  
  const fetchReviews = async () => {
    try {
      // Cancel any ongoing request
      if (reviewsAbortControllerRef.current) {
        reviewsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      reviewsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(reviewsAbortControllerRef.current.signal);
      
      if (!error) {
        dispatch({ type: 'SET_REVIEWS', payload: data || [] });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching reviews:', error);
      }
    }
  };
  
  const fetchSupportTickets = async () => {
    try {
      // Cancel any ongoing request
      if (supportTicketsAbortControllerRef.current) {
        supportTicketsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      supportTicketsAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(supportTicketsAbortControllerRef.current.signal);
      
      if (!error) {
        dispatch({ type: 'SET_SUPPORT_TICKETS', payload: data || [] });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching support tickets:', error);
      }
    }
  };
  
  const fetchSupportMessages = async () => {
    try {
      // Cancel any ongoing request
      if (supportMessagesAbortControllerRef.current) {
        supportMessagesAbortControllerRef.current.abort();
      }
      
      // Create new AbortController
      supportMessagesAbortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(supportMessagesAbortControllerRef.current.signal);
      
      if (!error) {
        dispatch({ type: 'SET_SUPPORT_MESSAGES', payload: data || [] });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching support messages:', error);
      }
    }
  };

  // Admin mutations
  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SET_AUTH_USER', payload: null });
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    // Get the current booking to compare status changes
    const { data: currentBooking } = await supabase
      .from('bookings')
      .select('*, users(full_name, email)')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('bookings').update(updates).eq('id', id);
    
    if (!error) {
      // Create admin notification for important status changes
      if (updates.status && currentBooking && updates.status !== currentBooking.status) {
        const customerName = currentBooking.users?.full_name || currentBooking.customer_name || 'Unknown Customer';
        const serviceName = currentBooking.service_name || 'Service';
        
        let notificationTitle = '';
        let notificationMessage = '';
        const notificationType = 'booking';
        let priority = 'medium';
        const actionUrl = `/admin/orders`;

        switch (updates.status) {
          case 'confirmed':
            notificationTitle = 'Booking Confirmed';
            notificationMessage = `Booking for ${serviceName} by ${customerName} has been confirmed`;
            priority = 'low';
            break;
          case 'completed':
            notificationTitle = 'Booking Completed';
            notificationMessage = `Booking for ${serviceName} by ${customerName} has been completed`;
            priority = 'medium';
            break;
          case 'cancelled':
            notificationTitle = 'Booking Cancelled';
            notificationMessage = `Booking for ${serviceName} by ${customerName} has been cancelled`;
            priority = 'high';
            break;
          case 'in_progress':
            notificationTitle = 'Booking In Progress';
            notificationMessage = `Booking for ${serviceName} by ${customerName} is now in progress`;
            priority = 'low';
            break;
        }

        if (notificationTitle) {
          try {
            await createAdminNotification({
              title: notificationTitle,
              message: notificationMessage,
              type: notificationType,
              priority: priority,
              action_url: actionUrl
            });
          } catch (notificationError) {
            console.error('Failed to create admin notification:', notificationError);
          }
        }
      }
      
      await fetchAllBookings();
    }
  };
  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) await fetchAllBookings();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (!error) await fetchAllUsers();
  };
  const deleteUser = async (id: string) => {
    console.log('Attempting to delete user with ID:', id);
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      console.log('User deleted successfully, refreshing user list...');
      
      // Fetch users without using the shared AbortController to avoid conflicts
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) {
          console.error('Error fetching users after deletion:', fetchError);
          dispatch({ type: 'SET_ERROR', payload: `Failed to refresh users: ${fetchError.message}` });
          return;
        }
        
        dispatch({ type: 'SET_USERS', payload: data || [] });
        console.log('User list refreshed after deletion');
      } catch (fetchError: any) {
        console.error('Unexpected error refreshing users:', fetchError);
        dispatch({ type: 'SET_ERROR', payload: `Failed to refresh users: ${fetchError.message}` });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const updateContactMessage = async (id: string, updates: Partial<ContactMessage>) => {
    const { error } = await supabase.from('contact_messages').update(updates).eq('id', id);
    if (!error) await fetchContactMessages();
  };
  const deleteContactMessage = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) await fetchContactMessages();
  };

  const createPickupDelivery = async (payload: Omit<PickupDelivery, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('pickup_deliveries').insert(payload);
    if (!error) await fetchPickupDeliveries();
  };
  const updatePickupDelivery = async (id: string, updates: Partial<PickupDelivery>) => {
    const { error } = await supabase.from('pickup_deliveries').update(updates).eq('id', id);
    if (!error) await fetchPickupDeliveries();
  };

  const createUserComplaint = async (payload: Omit<Complaint, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('user_complaints').insert(payload);
    if (!error) await fetchUserComplaints();
  };
  const updateUserComplaint = async (id: string, updates: Partial<Complaint>) => {
    const { error } = await supabase.from('user_complaints').update(updates).eq('id', id);
    if (!error) await fetchUserComplaints();
  };

  const updateAdminNotification = async (id: string, updates: Partial<AdminNotification>) => {
    const { error } = await supabase.from('admin_notifications').update(updates).eq('id', id);
    if (!error) await fetchAdminNotifications();
  };
  const deleteAdminNotification = async (id: string) => {
    const { error } = await supabase.from('admin_notifications').delete().eq('id', id);
    if (!error) await fetchAdminNotifications();
  };
  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase.from('admin_notifications').update({ status: 'read' }).eq('id', id);
    if (!error) await fetchAdminNotifications();
  };

  const createAdminNotification = async (payload: { title: string; message: string; type?: string; priority?: string; action_url?: string; action_label?: string }) => {
    const { error } = await supabase
      .from('admin_notifications')
      .insert([{
        title: payload.title,
        message: payload.message,
        type: payload.type || 'general',
        priority: payload.priority || 'medium',
        action_url: payload.action_url,
        action_label: payload.action_label,
        status: 'unread'
      }]);
    
    if (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
    
    // Manually refresh notifications since we don't listen to INSERT events to avoid loops
    debounceFetch('admin_notifications', fetchAdminNotifications);
  };

  // Review management
  const updateReview = async (id: string, updates: Partial<Review>) => {
    const { error } = await supabase.from('reviews').update(updates).eq('id', id);
    if (!error) await fetchReviews();
  };

  // Support ticket management
  const updateSupportTicket = async (id: string, updates: Partial<SupportTicket>) => {
    const { error } = await supabase.from('support_tickets').update(updates).eq('id', id);
    if (!error) await fetchSupportTickets();
  };
  const sendSupportMessage = async (payload: Omit<SupportMessage, 'id' | 'created_at'>) => {
    // Ensure proper admin identification
    const messageWithAdminInfo = {
      ...payload,
      sender_id: payload.sender_id || state.authUser?.id,
      sender_type: 'admin'
    };

    const { data, error } = await supabase
      .from('support_messages')
      .insert([messageWithAdminInfo])
      .select()
      .single();
    
    if (error) throw error;
    
    // Real-time subscription will handle the update, but we can also manually update for immediate feedback
    dispatch({ type: 'ADD_SUPPORT_MESSAGE', payload: data });
    
    return data;
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
    fetchSubscriptionPlans,
    fetchUserSubscriptions,
    fetchSubscriptionBilling,
    fetchSubscriptionCustomizations,
    updateUserSubscription,
    cancelUserSubscription,
    pauseUserSubscription,
    resumeUserSubscription,
    createSubscriptionBilling,
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
    deleteAdminNotification,
    markNotificationAsRead,
    createAdminNotification,
    updateSupportTicket,
    sendSupportMessage,
    markMessageAsRead,
    updateReview,
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSupabaseData(): SupabaseDataContextType {
  const ctx = useContext(SupabaseDataContext);
  if (!ctx) throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  return ctx;
}