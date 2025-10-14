-- Supabase Dev RLS Policies (SAFE)
-- Purpose: Enable read access for anon/authenticated roles during development
-- SAFE: Each block checks table existence and only applies policies when present.
-- Usage: Copy/paste into Supabase SQL editor and run in your project.

DO $$
DECLARE
  tbl TEXT;
BEGIN
  -- List of tables to consider (adjust as needed)
  FOR tbl IN SELECT unnest(ARRAY[
    'users',
    'bookings',
    'services',
    'addresses',
    'contact_messages',
    'notifications',
    'subscription_plans',
    'user_subscriptions',
    'subscription_billing',
    'subscription_customizations',
    'support_tickets',
    'support_messages',
    'chat_sessions',
    'reviews',
    'inspection_requests',
    'dry_cleaning_orders',
    'user_photos'
  ]) LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      -- Enable RLS
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

      -- Create dev read-all policy if missing
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = tbl AND polname = 'dev_read_all'
      ) THEN
        EXECUTE format('CREATE POLICY "dev_read_all" ON public.%I FOR SELECT USING (true);', tbl);
      END IF;
    END IF;
  END LOOP;
END $$;

-- Optional: allow authenticated writes in dev (SAFE)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'support_tickets', 'support_messages', 'reviews', 'inspection_requests', 'dry_cleaning_orders'
  ]) LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = tbl AND polname = 'dev_write_authenticated'
      ) THEN
        EXECUTE format('CREATE POLICY "dev_write_authenticated" ON public.%I FOR INSERT TO authenticated WITH CHECK (true);', tbl);
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = tbl AND polname = 'dev_update_authenticated'
      ) THEN
        EXECUTE format('CREATE POLICY "dev_update_authenticated" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);', tbl);
      END IF;
    END IF;
  END LOOP;
END $$;

-- Cleanup helper (manual):
-- SELECT format('DROP POLICY "%s" ON public.%s;', polname, tablename)
-- FROM pg_policies WHERE schemaname='public' AND polname LIKE 'dev_%';