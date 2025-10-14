-- Supabase Dev RLS Policies
-- Purpose: Enable read access for anon/authenticated roles during development
-- Usage: Copy/paste into Supabase SQL editor and run in your project.

-- NOTE: Adjust table names as needed to match your schema.

-- Helper: enable RLS and add a permissive read policy
-- Pattern:
--   alter table <table> enable row level security;
--   create policy "dev_read_all" on <table>
--     for select
--     using (true);

-- Core app tables
alter table users enable row level security;
create policy "dev_read_all" on users for select using (true);

alter table bookings enable row level security;
create policy "dev_read_all" on bookings for select using (true);

alter table services enable row level security;
create policy "dev_read_all" on services for select using (true);

alter table contact_messages enable row level security;
create policy "dev_read_all" on contact_messages for select using (true);

alter table reviews enable row level security;
create policy "dev_read_all" on reviews for select using (true);

alter table addresses enable row level security;
create policy "dev_read_all" on addresses for select using (true);

-- Admin-related tables
alter table pickup_deliveries enable row level security;
create policy "dev_read_all" on pickup_deliveries for select using (true);

alter table user_complaints enable row level security;
create policy "dev_read_all" on user_complaints for select using (true);

alter table notifications enable row level security;
create policy "dev_read_all" on notifications for select using (true);

alter table subscription_plans enable row level security;
create policy "dev_read_all" on subscription_plans for select using (true);

alter table user_subscriptions enable row level security;
create policy "dev_read_all" on user_subscriptions for select using (true);

alter table subscription_billing enable row level security;
create policy "dev_read_all" on subscription_billing for select using (true);

alter table subscription_customizations enable row level security;
create policy "dev_read_all" on subscription_customizations for select using (true);

alter table support_tickets enable row level security;
create policy "dev_read_all" on support_tickets for select using (true);

alter table support_messages enable row level security;
create policy "dev_read_all" on support_messages for select using (true);

alter table chat_sessions enable row level security;
create policy "dev_read_all" on chat_sessions for select using (true);

-- Optional: Allow inserts/updates for authenticated users in dev
-- Uncomment if needed
-- create policy "dev_write_authenticated" on <table>
--   for insert
--   to authenticated
--   with check (true);
--
-- create policy "dev_update_authenticated" on <table>
--   for update
--   to authenticated
--   using (true)
--   with check (true);

-- Cleanup: To remove dev policies later, use e.g.
-- drop policy if exists "dev_read_all" on <table>;