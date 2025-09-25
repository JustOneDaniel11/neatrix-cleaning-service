import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  service_type: string
  service_name: string
  date: string
  time: string
  address: string
  phone: string
  special_instructions?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  duration_hours: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: 'new' | 'read' | 'responded'
  created_at: string
  updated_at: string
}