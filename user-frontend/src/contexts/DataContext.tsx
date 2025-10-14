import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
  status: 'active' | 'inactive';
}

export interface Booking {
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
  notes?: string;
}

export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  method: 'card' | 'bank' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  transactionId?: string;
}

export interface PickupDelivery {
  id: string;
  userId: string;
  bookingId: string;
  type: 'pickup' | 'delivery';
  address: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-transit' | 'completed' | 'failed';
  driverName?: string;
  trackingNumber: string;
}

export interface AppState {
  users: User[];
  bookings: Booking[];
  payments: Payment[];
  pickupDeliveries: PickupDelivery[];
  currentUser: User | null;
  isAuthenticated: boolean;
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
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<Booking> } }
  | { type: 'DELETE_BOOKING'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: { id: string; updates: Partial<Payment> } }
  | { type: 'ADD_PICKUP_DELIVERY'; payload: PickupDelivery }
  | { type: 'UPDATE_PICKUP_DELIVERY'; payload: { id: string; updates: Partial<PickupDelivery> } }
  | { type: 'UPDATE_STATS' };

// Initial state - clean slate with no mock data
const initialState: AppState = {
  users: [],
  bookings: [],
  payments: [],
  pickupDeliveries: [],
  currentUser: null,
  isAuthenticated: false,
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
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };

    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload
      };

    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true
      };

    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false
      };

    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, action.payload]
      };

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

    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payload]
      };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id
            ? { ...payment, ...action.payload.updates }
            : payment
        )
      };

    case 'ADD_PICKUP_DELIVERY':
      return {
        ...state,
        pickupDeliveries: [...state.pickupDeliveries, action.payload]
      };

    case 'UPDATE_PICKUP_DELIVERY':
      return {
        ...state,
        pickupDeliveries: state.pickupDeliveries.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };

    case 'UPDATE_STATS':
      const today = new Date().toISOString().split('T')[0];
      return {
        ...state,
        stats: {
          totalBookings: state.bookings.length,
          totalRevenue: state.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => {
              const amt = Number(p.amount);
              return sum + (Number.isFinite(amt) ? amt : 0);
            }, 0),
          activeUsers: state.users.filter(u => u.status === 'active').length,
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
const DataContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Provider
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Update stats whenever state changes
  React.useEffect(() => {
    dispatch({ type: 'UPDATE_STATS' });
  }, [state.bookings, state.payments, state.users]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

// Hook
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Helper functions
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