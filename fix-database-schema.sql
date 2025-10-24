-- Fix database schema issues for admin dashboard
-- Run this in the Supabase SQL Editor

-- 1. Create admin_notifications table (if not exists)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'support', 'contact', 'system', 'user_activity')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  action_url TEXT,
  action_label TEXT,
  metadata JSONB,
  related_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Admin users can view admin notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admin users can create admin notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admin users can update admin notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admin users can delete admin notifications" ON public.admin_notifications;

-- 4. Create policies for admin notifications
CREATE POLICY "Admin users can view admin notifications" ON public.admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'contactneatrix@gmail.com'
    )
  );

CREATE POLICY "Admin users can create admin notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'contactneatrix@gmail.com'
    )
  );

CREATE POLICY "Admin users can update admin notifications" ON public.admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'contactneatrix@gmail.com'
    )
  );

CREATE POLICY "Admin users can delete admin notifications" ON public.admin_notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'contactneatrix@gmail.com'
    )
  );

-- 5. Ensure bookings table has proper admin access policies
-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "admin_full_access_bookings" ON public.bookings;

-- Create comprehensive admin access policy for bookings
CREATE POLICY "admin_full_access_bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'contactneatrix@gmail.com'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'contactneatrix@gmail.com'
    )
  );

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON public.admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON public.admin_notifications(priority);

-- 7. Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_admin_notifications_updated_at ON public.admin_notifications;
CREATE TRIGGER trigger_update_admin_notifications_updated_at
  BEFORE UPDATE ON public.admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_notifications_updated_at();

-- 9. Insert some sample admin notifications for testing
INSERT INTO public.admin_notifications (title, message, type, priority, action_url, action_label, metadata) VALUES
('System Initialization', 'Admin notification system has been set up successfully', 'system', 'normal', '/admin/dashboard', 'View Dashboard', '{"source": "system_setup"}'),
('Database Schema Updated', 'Admin notifications table created and configured', 'system', 'normal', '/admin/notifications', 'Manage Notifications', '{"source": "schema_update"}'),
('New Booking Received', 'A new cleaning service booking has been submitted and requires review', 'booking', 'high', '/admin/orders', 'View Bookings', '{"source": "booking_system"}'),
('Payment Processing Issue', 'There was an issue processing a customer payment that needs attention', 'payment', 'high', '/admin/payments', 'Check Payments', '{"source": "payment_system"}'),
('Customer Support Request', 'A customer has submitted a support ticket that requires immediate attention', 'support', 'medium', '/admin/contact-message', 'View Support', '{"source": "support_system"}')
ON CONFLICT DO NOTHING;