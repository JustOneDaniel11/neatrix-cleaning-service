import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Types (updated to match Supabase schema)
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  credits?: number;
  preferred_cleaner?: string;
  // Computed fields
  firstName?: string;
  lastName?: string;
  joinDate?: string;
  totalSpent?: number;
  status?: 'active' | 'inactive';
}

export interface Booking {
  id: string;
  user_id: string;
  service_type: string;
  service_name: string;
  date: string;
  service_date: string;
  time: string;
  address: string;
  phone: string;
  special_instructions?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  // Dry cleaning specific fields
  pickup_status?: 'pending' | 'scheduled' | 'picked_up';
  cleaning_status?: 'pending' | 'in_progress' | 'completed';
  delivery_status?: 'pending' | 'ready' | 'out_for_delivery' | 'delivered';
  pickup_date?: string;
  delivery_date?: string;
  estimated_completion?: string;
  item_count?: number;
  item_details?: any;
  tracking_notes?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for compatibility
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  service?: string;
  amount?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt?: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  duration_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
  updated_at: string;
}

export interface PickupDelivery {
  id: string;
  booking_id: string;
  user_id: string;
  type: 'pickup' | 'delivery';
  status: 'scheduled' | 'in_transit' | 'completed' | 'cancelled';
  pickup_address?: string;
  delivery_address?: string;
  scheduled_date: string;
  scheduled_time: string;
  actual_date?: string;
  actual_time?: string;
  driver_name?: string;
  driver_phone?: string;
  tracking_notes?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceName?: string;
}

export interface UserComplaint {
  id: string;
  user_id: string;
  booking_id?: string;
  complaint_type: 'service_quality' | 'billing' | 'staff_behavior' | 'scheduling' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'investigating' | 'resolved' | 'closed';
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // Computed fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'reminder' | 'support' | 'system' | 'dry_cleaning';
  status: 'unread' | 'read';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_label?: string;
  metadata?: any;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
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

export interface UserSubscription {
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
}

export interface SubscriptionBilling {
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

export interface SubscriptionCustomization {
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

// Support ticket and message interfaces for chat functionality
export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'service' | 'complaint';
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // Computed fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  senderName?: string;
  senderEmail?: string;
}

// Reviews interface
export interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
  service_type: string;
  // Computed fields
  user_name?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  admin_id?: string;
  status: 'active' | 'ended' | 'transferred';
  started_at: string;
  ended_at?: string;
  last_activity: string;
  // Computed fields
  customerName?: string;
  adminName?: string;
}

export interface AppState {
  users: User[];
  bookings: Booking[];
  services: Service[];
  contactMessages: ContactMessage[];
  reviews: Review[];
  pickupDeliveries: PickupDelivery[];
  userComplaints: UserComplaint[];
  addresses: Address[];
  notifications: Notification[];
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  subscriptionBilling: SubscriptionBilling[];
  subscriptionCustomizations: SubscriptionCustomization[];
  supportTickets: SupportTicket[];
  supportMessages: SupportMessage[];
  chatSessions: ChatSession[];
  currentUser: User | null;
  authUser: SupabaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  loadingCounter: number;
  error: string | null;
  stats: {
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    pendingBookings: number;
    completedBookings: number;
    todayBookings: number;
  };
}

// Actions
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_LOADING' }
  | { type: 'DECREMENT_LOADING' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTH_USER'; payload: SupabaseUser | null }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<Booking> } }
  | { type: 'DELETE_BOOKING'; payload: string }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'UPDATE_SERVICE'; payload: Service }
  | { type: 'SET_CONTACT_MESSAGES'; payload: ContactMessage[] }
  | { type: 'ADD_CONTACT_MESSAGE'; payload: ContactMessage }
  | { type: 'UPDATE_CONTACT_MESSAGE'; payload: { id: string; updates: Partial<ContactMessage> } }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'SET_PICKUP_DELIVERIES'; payload: PickupDelivery[] }
  | { type: 'ADD_PICKUP_DELIVERY'; payload: PickupDelivery }
  | { type: 'UPDATE_PICKUP_DELIVERY'; payload: { id: string; updates: Partial<PickupDelivery> } }
  | { type: 'SET_USER_COMPLAINTS'; payload: UserComplaint[] }
  | { type: 'ADD_USER_COMPLAINT'; payload: UserComplaint }
  | { type: 'UPDATE_USER_COMPLAINT'; payload: { id: string; updates: Partial<UserComplaint> } }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'UPDATE_ADDRESS'; payload: { id: string; updates: Partial<Address> } }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_SUBSCRIPTION_PLANS'; payload: SubscriptionPlan[] }
  | { type: 'ADD_SUBSCRIPTION_PLAN'; payload: SubscriptionPlan }
  | { type: 'UPDATE_SUBSCRIPTION_PLAN'; payload: { id: string; updates: Partial<SubscriptionPlan> } }
  | { type: 'SET_USER_SUBSCRIPTIONS'; payload: UserSubscription[] }
  | { type: 'ADD_USER_SUBSCRIPTION'; payload: UserSubscription }
  | { type: 'UPDATE_USER_SUBSCRIPTION'; payload: { id: string; updates: Partial<UserSubscription> } }
  | { type: 'DELETE_USER_SUBSCRIPTION'; payload: string }
  | { type: 'SET_SUBSCRIPTION_BILLING'; payload: SubscriptionBilling[] }
  | { type: 'ADD_SUBSCRIPTION_BILLING'; payload: SubscriptionBilling }
  | { type: 'SET_SUBSCRIPTION_CUSTOMIZATIONS'; payload: SubscriptionCustomization[] }
  | { type: 'ADD_SUBSCRIPTION_CUSTOMIZATION'; payload: SubscriptionCustomization }
  | { type: 'UPDATE_SUBSCRIPTION_CUSTOMIZATION'; payload: { id: string; updates: Partial<SubscriptionCustomization> } }
  | { type: 'SET_SUPPORT_TICKETS'; payload: SupportTicket[] }
  | { type: 'ADD_SUPPORT_TICKET'; payload: SupportTicket }
  | { type: 'UPDATE_SUPPORT_TICKET'; payload: { id: string; updates: Partial<SupportTicket> } }
  | { type: 'DELETE_SUPPORT_TICKET'; payload: string }
  | { type: 'SET_SUPPORT_MESSAGES'; payload: SupportMessage[] }
  | { type: 'ADD_SUPPORT_MESSAGE'; payload: SupportMessage }
  | { type: 'UPDATE_SUPPORT_MESSAGE'; payload: { id: string; updates: Partial<SupportMessage> } }
  | { type: 'DELETE_SUPPORT_MESSAGE'; payload: string }
  | { type: 'SET_CHAT_SESSIONS'; payload: ChatSession[] }
  | { type: 'ADD_CHAT_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_CHAT_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_CHAT_SESSION'; payload: string }
  | { type: 'LOGIN'; payload: { authUser: SupabaseUser; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_STATS' };

const initialState: AppState = {
  users: [],
  bookings: [],
  services: [],
  contactMessages: [],
  reviews: [],
  pickupDeliveries: [],
  userComplaints: [],
  addresses: [],
  notifications: [],
  subscriptionPlans: [],
  userSubscriptions: [],
  subscriptionBilling: [],
  subscriptionCustomizations: [],
  supportTickets: [],
  supportMessages: [],
  chatSessions: [],
  currentUser: null,
  authUser: null,
  isAuthenticated: false,
  loading: false,
  loadingCounter: 0,
  error: null,
  stats: {
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingBookings: 0,
    completedBookings: 0,
    todayBookings: 0
  }
};

// Reducer
function dataReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'INCREMENT_LOADING':
      const newCounter = state.loadingCounter + 1;
      return { 
        ...state, 
        loadingCounter: newCounter,
        loading: newCounter > 0
      };

    case 'DECREMENT_LOADING':
      const decrementedCounter = Math.max(0, state.loadingCounter - 1);
      return { 
        ...state, 
        loadingCounter: decrementedCounter,
        loading: decrementedCounter > 0
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_AUTH_USER':
      return { 
        ...state, 
        authUser: action.payload,
        isAuthenticated: !!action.payload
      };

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser
      };

    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };

    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };

    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates }
            : booking
        )
      };

    case 'DELETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.payload)
      };

    case 'SET_SERVICES':
      return { ...state, services: action.payload };

    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };

    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.id ? action.payload : service
        )
      };

    case 'SET_CONTACT_MESSAGES':
      return { ...state, contactMessages: action.payload };

    case 'ADD_CONTACT_MESSAGE':
      return { ...state, contactMessages: [...state.contactMessages, action.payload] };

    case 'UPDATE_CONTACT_MESSAGE':
      return {
        ...state,
        contactMessages: state.contactMessages.map(message =>
          message.id === action.payload.id
            ? { ...message, ...action.payload.updates }
            : message
        )
      };

    // Reviews
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };

    case 'ADD_REVIEW':
      return { ...state, reviews: [action.payload, ...state.reviews] };

    case 'SET_PICKUP_DELIVERIES':
      return { ...state, pickupDeliveries: action.payload };

    case 'ADD_PICKUP_DELIVERY':
      return { ...state, pickupDeliveries: [...state.pickupDeliveries, action.payload] };

    case 'UPDATE_PICKUP_DELIVERY':
      return {
        ...state,
        pickupDeliveries: state.pickupDeliveries.map(delivery =>
          delivery.id === action.payload.id
            ? { ...delivery, ...action.payload.updates }
            : delivery
        )
      };

    case 'SET_USER_COMPLAINTS':
      return { ...state, userComplaints: action.payload };

    case 'ADD_USER_COMPLAINT':
      return { ...state, userComplaints: [...state.userComplaints, action.payload] };

    case 'UPDATE_USER_COMPLAINT':
      return {
        ...state,
        userComplaints: state.userComplaints.map(complaint =>
          complaint.id === action.payload.id
            ? { ...complaint, ...action.payload.updates }
            : complaint
        )
      };

    case 'LOGIN':
      return {
        ...state,
        authUser: action.payload.authUser,
        currentUser: action.payload.user,
        isAuthenticated: true
      };

    case 'LOGOUT':
      return {
        ...state,
        authUser: null,
        currentUser: null,
        isAuthenticated: false
      };

    case 'SET_ADDRESSES':
      return { ...state, addresses: action.payload };

    case 'ADD_ADDRESS':
      return { ...state, addresses: [...state.addresses, action.payload] };

    case 'UPDATE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map(address =>
          address.id === action.payload.id 
            ? { ...address, ...action.payload.updates }
            : address
        )
      };

    case 'DELETE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.filter(address => address.id !== action.payload)
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id 
            ? { ...notification, ...action.payload.updates }
            : notification
        )
      };

    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload)
      };

    // Subscription Plans
    case 'SET_SUBSCRIPTION_PLANS':
      return { ...state, subscriptionPlans: action.payload };

    case 'ADD_SUBSCRIPTION_PLAN':
      return { ...state, subscriptionPlans: [...state.subscriptionPlans, action.payload] };

    case 'UPDATE_SUBSCRIPTION_PLAN':
      return {
        ...state,
        subscriptionPlans: state.subscriptionPlans.map(plan =>
          plan.id === action.payload.id 
            ? { ...plan, ...action.payload.updates }
            : plan
        )
      };

    // User Subscriptions
    case 'SET_USER_SUBSCRIPTIONS':
      return { ...state, userSubscriptions: action.payload };

    case 'ADD_USER_SUBSCRIPTION':
      return { ...state, userSubscriptions: [...state.userSubscriptions, action.payload] };

    case 'UPDATE_USER_SUBSCRIPTION':
      return {
        ...state,
        userSubscriptions: state.userSubscriptions.map(subscription =>
          subscription.id === action.payload.id 
            ? { ...subscription, ...action.payload.updates }
            : subscription
        )
      };

    case 'DELETE_USER_SUBSCRIPTION':
      return {
        ...state,
        userSubscriptions: state.userSubscriptions.filter(subscription => subscription.id !== action.payload)
      };

    // Subscription Billing
    case 'SET_SUBSCRIPTION_BILLING':
      return { ...state, subscriptionBilling: action.payload };

    case 'ADD_SUBSCRIPTION_BILLING':
      return { ...state, subscriptionBilling: [...state.subscriptionBilling, action.payload] };

    // Subscription Customizations
    case 'SET_SUBSCRIPTION_CUSTOMIZATIONS':
      return { ...state, subscriptionCustomizations: action.payload };

    case 'ADD_SUBSCRIPTION_CUSTOMIZATION':
      return { ...state, subscriptionCustomizations: [...state.subscriptionCustomizations, action.payload] };

    case 'UPDATE_SUBSCRIPTION_CUSTOMIZATION':
      return {
        ...state,
        subscriptionCustomizations: state.subscriptionCustomizations.map(customization =>
          customization.id === action.payload.id 
            ? { ...customization, ...action.payload.updates }
            : customization
        )
      };

    // Support Tickets
    case 'SET_SUPPORT_TICKETS':
      return { ...state, supportTickets: action.payload };

    case 'ADD_SUPPORT_TICKET':
      return { ...state, supportTickets: [...state.supportTickets, action.payload] };

    case 'UPDATE_SUPPORT_TICKET':
      return {
        ...state,
        supportTickets: state.supportTickets.map(ticket =>
          ticket.id === action.payload.id 
            ? { ...ticket, ...action.payload.updates }
            : ticket
        )
      };

    case 'DELETE_SUPPORT_TICKET':
      return {
        ...state,
        supportTickets: state.supportTickets.filter(ticket => ticket.id !== action.payload)
      };

    // Support Messages
    case 'SET_SUPPORT_MESSAGES':
      return { ...state, supportMessages: action.payload };

    case 'ADD_SUPPORT_MESSAGE':
      return { ...state, supportMessages: [...state.supportMessages, action.payload] };

    case 'UPDATE_SUPPORT_MESSAGE':
      return {
        ...state,
        supportMessages: state.supportMessages.map(message =>
          message.id === action.payload.id 
            ? { ...message, ...action.payload.updates }
            : message
        )
      };

    case 'DELETE_SUPPORT_MESSAGE':
      return {
        ...state,
        supportMessages: state.supportMessages.filter(message => message.id !== action.payload)
      };

    // Chat Sessions
    case 'SET_CHAT_SESSIONS':
      return { ...state, chatSessions: action.payload };

    case 'ADD_CHAT_SESSION':
      return { ...state, chatSessions: [...state.chatSessions, action.payload] };

    case 'UPDATE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.map(session =>
          session.id === action.payload.id 
            ? { ...session, ...action.payload.updates }
            : session
        )
      };

    case 'DELETE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.filter(session => session.id !== action.payload)
      };

    case 'UPDATE_STATS':
      const today = new Date().toISOString().split('T')[0];
      return {
        ...state,
        stats: {
          totalBookings: state.bookings.length,
          totalRevenue: state.bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => {
              const amt = Number(b.total_amount);
              return sum + (Number.isFinite(amt) ? amt : 0);
            }, 0),
          activeUsers: state.users.length,
          pendingBookings: state.bookings.filter(b => b.status === 'pending').length,
          completedBookings: state.bookings.filter(b => b.status === 'completed').length,
          todayBookings: state.bookings.filter(b => b.date === today).length
        }
      };

    default:
      return state;
  }
}

// Context
const SupabaseDataContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Supabase methods
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  createContactMessage: (message: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  fetchUserBookings: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchContactMessages: () => Promise<void>;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => Promise<void>;
  // Reviews
  fetchReviews: () => Promise<void>;
  createReview: (review: Omit<Review, 'id' | 'created_at' | 'user_name'>) => Promise<void>;
  // Admin methods
  fetchAllUsers: () => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  // Pickup/Delivery methods
  fetchPickupDeliveries: () => Promise<void>;
  createPickupDelivery: (delivery: Omit<PickupDelivery, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePickupDelivery: (id: string, updates: Partial<PickupDelivery>) => Promise<void>;
  // User Complaints methods
  fetchUserComplaints: () => Promise<void>;
  createUserComplaint: (complaint: Omit<UserComplaint, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUserComplaint: (id: string, updates: Partial<UserComplaint>) => Promise<void>;
  // Address management
  fetchUserAddresses: () => Promise<void>;
  createAddress: (address: Omit<Address, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  // Notification methods
  fetchNotifications: () => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNotification: (id: string, updates: Partial<Notification>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  // Subscription management functions
  fetchSubscriptionPlans: () => Promise<void>;
  createSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscriptionPlan: (id: string, updates: Partial<SubscriptionPlan>) => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  createUserSubscription: (subscription: Omit<UserSubscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUserSubscription: (id: string, updates: Partial<UserSubscription>) => Promise<void>;
  cancelUserSubscription: (id: string) => Promise<void>;
  fetchSubscriptionBilling: () => Promise<void>;
  createSubscriptionBilling: (billing: Omit<SubscriptionBilling, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  fetchSubscriptionCustomizations: () => Promise<void>;
  createSubscriptionCustomization: (customization: Omit<SubscriptionCustomization, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscriptionCustomization: (id: string, updates: Partial<SubscriptionCustomization>) => Promise<void>;
  // Support ticket functions
  fetchSupportTickets: (userId?: string) => Promise<void>;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'ticket_number'>) => Promise<SupportTicket>;
  getOrCreateSupportTicket: (userId: string, subject?: string, description?: string) => Promise<SupportTicket>;
  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => Promise<void>;
  deleteSupportTicket: (id: string) => Promise<void>;
  fetchSupportMessages: (ticketId?: string) => Promise<void>;
  createSupportMessage: (message: Omit<SupportMessage, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupportMessage: (id: string, updates: Partial<SupportMessage>) => Promise<void>;
  deleteDefaultAdminMessagesForUser: (userEmail: string) => Promise<number>;
  fetchChatSessions: (userId?: string) => Promise<void>;
  createChatSession: (session: Omit<ChatSession, 'id' | 'started_at' | 'last_activity'>) => Promise<ChatSession>;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => Promise<void>;
  // Dry cleaning functions
  updateDryCleaningStatus: (bookingId: string, statusUpdates: {
    pickup_status?: 'pending' | 'scheduled' | 'picked_up';
    cleaning_status?: 'pending' | 'in_progress' | 'completed';
    delivery_status?: 'pending' | 'ready' | 'out_for_delivery' | 'delivered';
    pickup_date?: string;
    delivery_date?: string;
    estimated_completion?: string;
    tracking_notes?: string;
  }) => Promise<void>;
  updateDryCleaningItems: (bookingId: string, itemCount: number, itemDetails: any) => Promise<void>;
} | null>(null);

// Provider
export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false;

    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          dispatch({ type: 'SET_AUTH_USER', payload: null });
          dispatch({ type: 'SET_CURRENT_USER', payload: null });
        } else if (session?.user) {
          // User is already authenticated
          dispatch({ type: 'SET_AUTH_USER', payload: session.user });
          
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userProfile) {
            dispatch({ type: 'SET_CURRENT_USER', payload: userProfile });
          }
        } else {
          // No session found
          dispatch({ type: 'SET_AUTH_USER', payload: null });
          dispatch({ type: 'SET_CURRENT_USER', payload: null });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        dispatch({ type: 'SET_AUTH_USER', payload: null });
        dispatch({ type: 'SET_CURRENT_USER', payload: null });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        isInitialized = true;
      }
    };

    initializeAuth();

    // Listen for auth changes - only after initialization is complete
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip auth state changes during initialization to prevent race conditions
      if (!isInitialized) return;

      if (event === 'SIGNED_IN' && session?.user) {
        dispatch({ type: 'SET_AUTH_USER', payload: session.user });
        
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userProfile) {
          dispatch({ type: 'SET_CURRENT_USER', payload: userProfile });
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time subscriptions for data synchronization
  useEffect(() => {
    const subscriptions: any[] = [];

    // Subscribe to bookings changes
    const bookingsSubscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Bookings change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_BOOKING', payload: payload.new as Booking });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({ 
              type: 'UPDATE_BOOKING', 
              payload: { id: payload.new.id, updates: payload.new as Partial<Booking> }
            });
          } else if (payload.eventType === 'DELETE') {
            dispatch({ type: 'DELETE_BOOKING', payload: payload.old.id });
          }
        }
      )
      .subscribe();

    // Subscribe to contact messages changes
    const contactSubscription = supabase
      .channel('contact_messages_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        (payload) => {
          console.log('Contact messages change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_CONTACT_MESSAGE', payload: payload.new as ContactMessage });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'UPDATE_CONTACT_MESSAGE',
              payload: { id: payload.new.id, updates: payload.new as Partial<ContactMessage> }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to users changes
    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Users change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_USER', payload: payload.new as User });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({ type: 'UPDATE_USER', payload: payload.new as User });
          }
        }
      )
      .subscribe();

    // Subscribe to pickup/delivery changes
    const pickupDeliverySubscription = supabase
      .channel('pickup_deliveries_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pickup_deliveries' },
        (payload) => {
          console.log('Pickup/Delivery change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_PICKUP_DELIVERY', payload: payload.new as PickupDelivery });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'UPDATE_PICKUP_DELIVERY',
              payload: { id: payload.new.id, updates: payload.new as Partial<PickupDelivery> }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to user complaints changes
    const complaintsSubscription = supabase
      .channel('user_complaints_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_complaints' },
        (payload) => {
          console.log('User complaints change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_USER_COMPLAINT', payload: payload.new as UserComplaint });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'UPDATE_USER_COMPLAINT',
              payload: { id: payload.new.id, updates: payload.new as Partial<UserComplaint> }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsSubscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Notifications change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_NOTIFICATION', payload: payload.new as Notification });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'UPDATE_NOTIFICATION',
              payload: { id: payload.new.id, updates: payload.new as Partial<Notification> }
            });
          } else if (payload.eventType === 'DELETE') {
            dispatch({ type: 'DELETE_NOTIFICATION', payload: payload.old.id });
          }
        }
      )
      .subscribe();

    subscriptions.push(
      bookingsSubscription,
      contactSubscription,
      usersSubscription,
      pickupDeliverySubscription,
      complaintsSubscription,
      notificationsSubscription
    );

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(subscription => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      });
    };
  }, []);

  // Update stats when data changes
  useEffect(() => {
    dispatch({ type: 'UPDATE_STATS' });
  }, [state.bookings, state.users]);

  // Auth methods
  const signUp = async (email: string, password: string, fullName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // User profile will be created automatically via trigger
        dispatch({ type: 'SET_AUTH_USER', payload: data.user });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Don't re-throw the error to prevent unhandled promise rejection
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        dispatch({ type: 'SET_AUTH_USER', payload: data.user });
        
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userProfile) {
          dispatch({ type: 'SET_CURRENT_USER', payload: userProfile });
        }
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      dispatch({ type: 'LOGOUT' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetPassword = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Booking methods
  const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    if (!state.authUser) throw new Error('User must be authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          user_id: state.authUser.id
        }])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_BOOKING', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_BOOKING', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteBooking = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_BOOKING', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Dry cleaning specific functions
  const updateDryCleaningStatus = async (bookingId: string, statusUpdates: {
    pickup_status?: 'pending' | 'scheduled' | 'picked_up';
    cleaning_status?: 'pending' | 'in_progress' | 'completed';
    delivery_status?: 'pending' | 'ready' | 'out_for_delivery' | 'delivered';
    pickup_date?: string;
    delivery_date?: string;
    estimated_completion?: string;
    tracking_notes?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(statusUpdates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_BOOKING', payload: { id: bookingId, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateDryCleaningItems = async (bookingId: string, itemCount: number, itemDetails: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          item_count: itemCount,
          item_details: itemDetails 
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_BOOKING', payload: { id: bookingId, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Contact message method
  const createContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          ...messageData,
          status: 'new'
        }])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_CONTACT_MESSAGE', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch methods
  const fetchUserBookings = async () => {
    if (!state.authUser) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', state.authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_BOOKINGS', payload: data || [] });
    } catch (error: any) {
      console.error('Error fetching user bookings:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Set empty bookings array on error to prevent infinite loading
      dispatch({ type: 'SET_BOOKINGS', payload: [] });
    } finally {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const fetchServices = async () => {
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      dispatch({ type: 'SET_SERVICES', payload: data || [] });
    } catch (error: any) {
      console.error('Error fetching services:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_SERVICES', payload: [] });
    } finally {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const fetchContactMessages = async () => {
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_CONTACT_MESSAGES', payload: data || [] });
    } catch (error: any) {
      console.error('Error fetching contact messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_CONTACT_MESSAGES', payload: [] });
    } finally {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateContactMessage = async (id: string, updates: Partial<ContactMessage>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_CONTACT_MESSAGE', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Reviews
  const fetchReviews = async () => {
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try {
      // If auth user exists, fetch their reviews; otherwise fetch recent reviews
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (state.authUser) {
        query = query.eq('user_id', state.authUser.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch({ type: 'SET_REVIEWS', payload: data || [] });
    } catch (error: any) {
      const msg = error?.message || '';
      // Gracefully handle missing table in environments where reviews table isn't created yet
      if (msg.includes("Could not find the table 'public.reviews'")) {
        dispatch({ type: 'SET_REVIEWS', payload: [] });
      } else {
        console.error('Error fetching reviews:', error);
        dispatch({ type: 'SET_ERROR', payload: msg });
        dispatch({ type: 'SET_REVIEWS', payload: [] });
      }
    } finally {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const createReview = async (review: Omit<Review, 'id' | 'created_at' | 'user_name'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const payload = { ...review, user_id: review.user_id || state.authUser.id } as Omit<Review, 'id' | 'created_at' | 'user_name'> & { user_id: string };

      const { data, error } = await supabase
        .from('reviews')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_REVIEW', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Admin cleanup: delete default admin welcome messages for a user's tickets
  const deleteDefaultAdminMessagesForUser = async (userEmail: string): Promise<number> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Find user by email in app users table
      const { data: users, error: userErr } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userEmail)
        .limit(1);
      if (userErr) throw userErr;
      const user = users && users.length > 0 ? users[0] : null;
      if (!user) {
        // If app users table doesn't have it, try auth user from state
        if (state.authUser?.email === userEmail) {
          // Proceed using auth user id
          const userId = state.authUser.id;
          // Get tickets for this user
          const { data: tickets, error: ticketErr } = await supabase
            .from('support_tickets')
            .select('id')
            .eq('user_id', userId);
          if (ticketErr) throw ticketErr;
          const ids = (tickets || []).map(t => t.id);
          if (ids.length === 0) return 0;
          const { error: delErr } = await supabase
            .from('support_messages')
            .delete()
            .in('ticket_id', ids)
            .eq('sender_type', 'admin')
            .eq('message', 'Thanks for reaching out! Our support team will respond shortly.');
          if (delErr) throw delErr;
          return ids.length;
        }
        return 0;
      }

      const userId = user.id as string;
      // Get tickets for this user
      const { data: tickets, error: ticketErr } = await supabase
        .from('support_tickets')
        .select('id')
        .eq('user_id', userId);
      if (ticketErr) throw ticketErr;
      const ids = (tickets || []).map(t => t.id);
      if (ids.length === 0) return 0;

      const { error: delErr } = await supabase
        .from('support_messages')
        .delete()
        .in('ticket_id', ids)
        .eq('sender_type', 'admin')
        .eq('message', 'Thanks for reaching out! Our support team will respond shortly.');
      if (delErr) throw delErr;
      return ids.length;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Admin methods
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_USERS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const fetchAllBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users!inner(
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include user information
      const transformedBookings = data?.map(booking => ({
        ...booking,
        userName: booking.users?.full_name || 'Unknown',
        userEmail: booking.users?.email || '',
        userPhone: booking.users?.phone || booking.phone
      })) || [];

      dispatch({ type: 'SET_BOOKINGS', payload: transformedBookings });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_USER', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteUser = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove user from local state
      dispatch({ type: 'SET_USERS', payload: state.users.filter(user => user.id !== id) });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Pickup/Delivery methods
  const fetchPickupDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_deliveries')
        .select(`
          *,
          users!inner(
            full_name,
            email,
            phone
          ),
          bookings!inner(
            service_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include user and booking information
      const transformedDeliveries = data?.map(delivery => ({
        ...delivery,
        customerName: delivery.users?.full_name || 'Unknown',
        customerEmail: delivery.users?.email || '',
        customerPhone: delivery.users?.phone || '',
        serviceName: delivery.bookings?.service_name || 'Unknown Service'
      })) || [];

      dispatch({ type: 'SET_PICKUP_DELIVERIES', payload: transformedDeliveries });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createPickupDelivery = async (delivery: Omit<PickupDelivery, 'id' | 'created_at' | 'updated_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('pickup_deliveries')
        .insert([delivery])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_PICKUP_DELIVERY', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePickupDelivery = async (id: string, updates: Partial<PickupDelivery>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('pickup_deliveries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_PICKUP_DELIVERY', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // User Complaints methods
  const fetchUserComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('user_complaints')
        .select(`
          *,
          users!inner(
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include user information
      const transformedComplaints = data?.map(complaint => ({
        ...complaint,
        customerName: complaint.users?.full_name || 'Unknown',
        customerEmail: complaint.users?.email || '',
        customerPhone: complaint.users?.phone || ''
      })) || [];

      dispatch({ type: 'SET_USER_COMPLAINTS', payload: transformedComplaints });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createUserComplaint = async (complaint: Omit<UserComplaint, 'id' | 'created_at' | 'updated_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('user_complaints')
        .insert([complaint])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_USER_COMPLAINT', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUserComplaint = async (id: string, updates: Partial<UserComplaint>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('user_complaints')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_USER_COMPLAINT', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Address management functions
  const fetchUserAddresses = async () => {
    if (!state.authUser) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', state.authUser.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_ADDRESSES', payload: data || [] });
    } catch (error: any) {
      console.error('Error fetching user addresses:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Set empty addresses array on error to prevent infinite loading
      dispatch({ type: 'SET_ADDRESSES', payload: [] });
    } finally {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const createAddress = async (address: Omit<Address, 'id' | 'created_at' | 'updated_at'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // If this is being set as default, unset other defaults first
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', state.authUser.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: state.authUser.id
        })
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_ADDRESS', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // If this is being set as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', state.authUser.id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', state.authUser.id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_ADDRESS', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAddress = async (id: string) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', state.authUser.id);

      if (error) throw error;

      dispatch({ type: 'DELETE_ADDRESS', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Notification functions
  const fetchNotifications = async () => {
    if (!state.authUser) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', state.authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_NOTIFICATIONS', payload: data || [] });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_NOTIFICATION', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', state.authUser.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', state.authUser.id);

      if (error) throw error;

      dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await updateNotification(id, { status: 'read' });
  };

  const markAllNotificationsAsRead = async () => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', state.authUser.id)
        .eq('status', 'unread');

      if (error) throw error;

      // Update all unread notifications to read in state
      const updatedNotifications = state.notifications.map(notification =>
        notification.status === 'unread' 
          ? { ...notification, status: 'read' as const }
          : notification
      );
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Subscription management functions
  const fetchSubscriptionPlans = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('base_price', { ascending: true });

      if (error) throw error;
      dispatch({ type: 'SET_SUBSCRIPTION_PLANS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSubscriptionPlan = async (plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_SUBSCRIPTION_PLAN', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSubscriptionPlan = async (id: string, updates: Partial<SubscriptionPlan>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_SUBSCRIPTION_PLAN', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', state.authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: 'SET_USER_SUBSCRIPTIONS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createUserSubscription = async (subscription: Omit<UserSubscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{ ...subscription, user_id: state.authUser.id }])
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_USER_SUBSCRIPTION', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUserSubscription = async (id: string, updates: Partial<UserSubscription>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_USER_SUBSCRIPTION', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const cancelUserSubscription = async (id: string) => {
    await updateUserSubscription(id, { 
      status: 'cancelled',
      auto_renew: false,
      end_date: new Date().toISOString()
    });
  };

  const fetchSubscriptionBilling = async () => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_billing')
        .select('*')
        .eq('user_id', state.authUser.id)
        .order('billing_date', { ascending: false });

      if (error) throw error;
      dispatch({ type: 'SET_SUBSCRIPTION_BILLING', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSubscriptionBilling = async (billing: Omit<SubscriptionBilling, 'id' | 'created_at' | 'updated_at'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_billing')
        .insert([{ ...billing, user_id: state.authUser.id }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_SUBSCRIPTION_BILLING', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchSubscriptionCustomizations = async () => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_customizations')
        .select('*')
        .eq('user_id', state.authUser.id);

      if (error) throw error;
      dispatch({ type: 'SET_SUBSCRIPTION_CUSTOMIZATIONS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSubscriptionCustomization = async (customization: Omit<SubscriptionCustomization, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_customizations')
        .insert([{ ...customization, user_id: state.authUser.id }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_SUBSCRIPTION_CUSTOMIZATION', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSubscriptionCustomization = async (id: string, updates: Partial<SubscriptionCustomization>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('subscription_customizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_SUBSCRIPTION_CUSTOMIZATION', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Support Tickets
  const fetchSupportTickets = async (userId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch({ type: 'SET_SUPPORT_TICKETS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'ticket_number'>): Promise<SupportTicket> => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Generate ticket number
      const ticketNumber = `TICKET-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{ ...ticket, ticket_number: ticketNumber }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_SUPPORT_TICKET', payload: data });
      return data as SupportTicket;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getOrCreateSupportTicket = async (
    userId: string,
    subject: string = 'General Support',
    description: string = 'User initiated chat in Support Center'
  ): Promise<SupportTicket> => {
    dispatch({ type: 'INCREMENT_LOADING' });
    try {
      // Try to find an existing open ticket for the user
      const { data: existing, error: findError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1);

      if (findError) throw findError;
      const ticket = existing && existing.length > 0 ? existing[0] as SupportTicket : null;
      if (ticket) {
        return ticket;
      }

      // Create a new ticket if none exists
      const created = await createSupportTicket({
        user_id: userId,
        subject,
        description,
        status: 'open',
        priority: 'normal',
        category: 'general'
      });
      return created;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateSupportTicket = async (id: string, updates: Partial<SupportTicket>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_SUPPORT_TICKET', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteSupportTicket = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_SUPPORT_TICKET', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Support Messages
  const fetchSupportMessages = async (ticketId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let query = supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (ticketId) {
        query = query.eq('ticket_id', ticketId);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch({ type: 'SET_SUPPORT_MESSAGES', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSupportMessage = async (message: Omit<SupportMessage, 'id' | 'created_at' | 'updated_at'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_SUPPORT_MESSAGE', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSupportMessage = async (id: string, updates: Partial<SupportMessage>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_SUPPORT_MESSAGE', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Chat Sessions
  const fetchChatSessions = async (userId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch({ type: 'SET_CHAT_SESSIONS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createChatSession = async (session: Omit<ChatSession, 'id' | 'started_at' | 'last_activity'>) => {
    if (!state.authUser) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ ...session, started_at: now, last_activity: now }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_CHAT_SESSION', payload: data });
      return data;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateChatSession = async (id: string, updates: Partial<ChatSession>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ ...updates, last_activity: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_CHAT_SESSION', payload: { id, updates: data } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <SupabaseDataContext.Provider value={{
      state,
      dispatch,
      signUp,
      signIn,
      signOut,
      resetPassword,
      createBooking,
      updateBooking,
      deleteBooking,
      createContactMessage,
      fetchUserBookings,
      fetchServices,
      fetchContactMessages,
      updateContactMessage,
      fetchReviews,
      createReview,
      fetchAllUsers,
      fetchAllBookings,
      updateUser,
      deleteUser,
      fetchPickupDeliveries,
      createPickupDelivery,
      updatePickupDelivery,
      fetchUserComplaints,
      createUserComplaint,
      updateUserComplaint,
      fetchUserAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
      fetchNotifications,
      createNotification,
      updateNotification,
      deleteNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      fetchSubscriptionPlans,
      createSubscriptionPlan,
      updateSubscriptionPlan,
      fetchUserSubscriptions,
      createUserSubscription,
      updateUserSubscription,
      cancelUserSubscription,
      fetchSubscriptionBilling,
      createSubscriptionBilling,
      fetchSubscriptionCustomizations,
      createSubscriptionCustomization,
      updateSubscriptionCustomization,
      fetchSupportTickets,
      createSupportTicket,
      getOrCreateSupportTicket,
      updateSupportTicket,
      deleteSupportTicket,
      fetchSupportMessages,
      createSupportMessage,
      updateSupportMessage,
      deleteDefaultAdminMessagesForUser,
      fetchChatSessions,
      createChatSession,
      updateChatSession,
      updateDryCleaningStatus,
      updateDryCleaningItems
    }}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

// Hook
export function useSupabaseData() {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
}

// Helper functions (keeping for compatibility)
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number): string {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(safe);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}