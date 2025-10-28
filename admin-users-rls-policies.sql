-- Admin RLS Policies for Users Table
-- Execute this in Supabase SQL Editor to allow admin operations

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "admin_read_users" ON public.users;
DROP POLICY IF EXISTS "admin_update_users" ON public.users;
DROP POLICY IF EXISTS "admin_delete_users" ON public.users;
DROP POLICY IF EXISTS "admin_insert_users" ON public.users;
DROP POLICY IF EXISTS "admin_all_users" ON public.users;

-- Create comprehensive admin policies for the users table
-- These policies allow the admin user (contactneatrix@gmail.com) to perform all operations

-- Allow admin to read all users
CREATE POLICY "admin_read_users" ON public.users
  FOR SELECT
  USING (auth.email() = 'contactneatrix@gmail.com');

-- Allow admin to update all users
CREATE POLICY "admin_update_users" ON public.users
  FOR UPDATE
  USING (auth.email() = 'contactneatrix@gmail.com')
  WITH CHECK (auth.email() = 'contactneatrix@gmail.com');

-- Allow admin to delete all users
CREATE POLICY "admin_delete_users" ON public.users
  FOR DELETE
  USING (auth.email() = 'contactneatrix@gmail.com');

-- Allow admin to insert new users
CREATE POLICY "admin_insert_users" ON public.users
  FOR INSERT
  WITH CHECK (auth.email() = 'contactneatrix@gmail.com');

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' 
  AND policyname LIKE 'admin_%'
ORDER BY policyname;