-- Fix Admin Users Policies
-- Add missing UPDATE and DELETE policies for admin on users table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_read_users" ON public.users;
DROP POLICY IF EXISTS "admin_update_users" ON public.users;
DROP POLICY IF EXISTS "admin_delete_users" ON public.users;
DROP POLICY IF EXISTS "admin_full_access_users" ON public.users;

-- Create comprehensive admin policies for users table
CREATE POLICY "admin_read_users" ON public.users
  FOR SELECT USING (auth.email() = 'contactneatrix@gmail.com');

CREATE POLICY "admin_update_users" ON public.users
  FOR UPDATE USING (auth.email() = 'contactneatrix@gmail.com');

CREATE POLICY "admin_delete_users" ON public.users
  FOR DELETE USING (auth.email() = 'contactneatrix@gmail.com');

-- Alternative: Create a single comprehensive policy for all operations
CREATE POLICY "admin_full_access_users" ON public.users
  FOR ALL USING (auth.email() = 'contactneatrix@gmail.com');

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND policyname LIKE '%admin%';