import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Admin-specific interfaces
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
  status: 'active' | 'inactive';
  lastLogin?: string;
  bookingsCount: number;
}

export interface AdminBooking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  assignedStaff?: string;
}

export interface AdminPayment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  method: 'card' | 'bank' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  transactionId?: string;
  processingFee?: number;
}

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingBookings: number;
  completedBookings: number;
  todayBookings: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  customerRetentionRate: number;
}

export interface AdminState {
  users: AdminUser[];
  bookings: AdminBooking[];
  payments: AdminPayment[];
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;
}

// Admin actions
type AdminAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_USER'; payload: AdminUser }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<AdminUser> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_BOOKING'; payload: AdminBooking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<AdminBooking> } }
  | { type: 'DELETE_BOOKING'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: AdminPayment }
  | { type: 'UPDATE_PAYMENT'; payload: { id: string; updates: Partial<AdminPayment> } }
  | { type: 'CALCULATE_STATS' };

// Initial admin state - empty state for production use
const initialAdminState: AdminState = {
  users: [],
  bookings: [],
  payments: [],
  stats: {
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingBookings: 0,
    completedBookings: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    customerRetentionRate: 0
  },
  isLoading: false,
  error: null
};

// Admin reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        )
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : booking
        )
      };
    
    case 'DELETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.payload)
      };
    
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id
            ? { ...payment, ...action.payload.updates }
            : payment
        )
      };
    
    case 'CALCULATE_STATS':
      const totalBookings = state.bookings.length;
      const totalRevenue = state.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      const activeUsers = state.users.filter(u => u.status === 'active').length;
      const pendingBookings = state.bookings.filter(b => b.status === 'pending').length;
      const completedBookings = state.bookings.filter(b => b.status === 'completed').length;
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = state.bookings.filter(b => b.date === today).length;
      
      return {
        ...state,
        stats: {
          ...state.stats,
          totalBookings,
          totalRevenue,
          activeUsers,
          pendingBookings,
          completedBookings,
          todayBookings,
          averageOrderValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
        }
      };
    
    default:
      return state;
  }
}

// Admin context
const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
} | null>(null);

// Admin provider
export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialAdminState);

  return (
    <AdminContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
}

// Admin hook
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Utility functions for admin
export function generateAdminId(): string {
  return 'admin-' + Math.random().toString(36).substr(2, 9);
}

export function formatAdminCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAdminDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatAdminDateTime(date: string): string {
  return new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}