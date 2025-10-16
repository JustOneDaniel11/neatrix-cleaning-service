-- Fix for "Order not found or not updated" error
-- This SQL adds the missing UPDATE policies for admin dashboard operations
-- The existing dev_read_all policies allow SELECT but not UPDATE

-- Add UPDATE policies for admin dashboard operations
-- These work alongside the existing dev_read_all policies

-- 1. Allow updating bookings for admin operations (tracking stage, status, etc.)
DROP POLICY IF EXISTS "admin_update_bookings" ON public.bookings;
CREATE POLICY "admin_update_bookings" ON public.bookings
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- 2. Allow inserting bookings if needed for admin operations
DROP POLICY IF EXISTS "admin_insert_bookings" ON public.bookings;
CREATE POLICY "admin_insert_bookings" ON public.bookings
  FOR INSERT 
  WITH CHECK (true);

-- 3. Ensure users table has proper read access for joins (should already exist)
DROP POLICY IF EXISTS "admin_read_users" ON public.users;
CREATE POLICY "admin_read_users" ON public.users
  FOR SELECT 
  USING (true);

-- Alternative: Create a comprehensive admin policy that covers all operations
-- Uncomment this if you prefer a single policy approach:
/*
DROP POLICY IF EXISTS "admin_full_access_bookings" ON public.bookings;
CREATE POLICY "admin_full_access_bookings" ON public.bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);
*/

-- Verify the policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('bookings', 'users')
  AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- Also show all policies for bookings table to see the complete picture
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY policyname;