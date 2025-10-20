
-- =====================================================
-- Email Confirmation Database Fixes
-- =====================================================
-- Run these commands in Supabase SQL Editor if needed

-- 1. Check current auth configuration
SELECT 
    raw_app_meta_data,
    raw_user_meta_data,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check if email confirmations are working
SELECT 
    COUNT(*) as total_users,
    COUNT(email_confirmed_at) as confirmed_users,
    COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

-- 3. Enable email confirmations (if not already enabled)
-- Note: This should be done through the dashboard, not SQL

-- 4. Check for any auth-related errors
SELECT 
    created_at,
    level,
    msg
FROM auth.audit_log_entries 
WHERE level = 'ERROR'
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Verify auth schema is properly set up
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name IN ('users', 'sessions', 'refresh_tokens')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- End of SQL Fixes
-- =====================================================
