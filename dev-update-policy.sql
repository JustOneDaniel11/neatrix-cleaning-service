-- Temporary development policy to allow updates for testing
-- This should be removed in production

-- Add a permissive update policy for development
CREATE POLICY "dev_update_all" ON public.bookings
  FOR UPDATE USING (true);

-- Also add insert policy for completeness
CREATE POLICY "dev_insert_all" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings';