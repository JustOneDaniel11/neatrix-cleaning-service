-- Fix the admin RLS policy to include the correct admin email

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can update tracking stages" ON public.bookings;

-- Create a new admin policy with the correct email
CREATE POLICY "Admins can update tracking stages" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@cleaningservice.com', 'manager@cleaningservice.com', 'contactneatrix@gmail.com')
    )
  );

-- Also create a policy for all operations (SELECT, INSERT, UPDATE, DELETE) for the admin
CREATE POLICY "Admin full access" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email = 'contactneatrix@gmail.com'
    )
  );

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings';