import { supabase, isSupabaseConfigured } from '@shared/lib/supabaseClient'
export { supabase, isSupabaseConfigured } from '@shared/lib/supabaseClient'

// Test connection function
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key (partial):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return;
  }
  
  // Test basic URL accessibility
  try {
    console.log('🌐 Testing basic URL accessibility...');
    const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    console.log('📡 URL Response Status:', response.status, response.statusText);
    
    if (response.status === 404) {
      console.warn('⚠️ Project might be paused or doesn\'t exist');
    }
  } catch (urlError) {
    console.error('❌ URL accessibility test failed:', urlError);
    if (urlError.name === 'TypeError' && urlError.message.includes('Failed to fetch')) {
      console.error('🚨 LIKELY CAUSE: Supabase project is PAUSED or INACTIVE');
      console.error('💡 SOLUTION: Go to https://supabase.com/dashboard and unpause your project');
    }
  }
  
  // Test Supabase client connection
  try {
    console.log('🔌 Testing Supabase client connection...');
    const { data, error } = await supabase
      .from('services')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase client connection failed:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Supabase client connection successful');
    }
  } catch (err) {
    console.error('❌ Supabase client connection error:', err);
    console.error('Error type:', typeof err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      console.error('🚨 LIKELY CAUSE: Supabase project is PAUSED or INACTIVE');
      console.error('💡 SOLUTION: Go to https://supabase.com/dashboard and unpause your project');
      console.error('📋 Steps to fix:');
      console.error('   1. Visit https://supabase.com/dashboard');
      console.error('   2. Find your project: hrkpbuenwejwspjrfgkd');
      console.error('   3. Click "Unpause" or "Resume" if the project is paused');
      console.error('   4. Wait for the project to become active');
      console.error('   5. Refresh this page');
    }
  }
}

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
  pickup_option?: 'pickup' | 'delivery'
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