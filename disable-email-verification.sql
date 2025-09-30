-- Fix email verification for existing test user
-- This should be run in the Supabase SQL Editor

-- Note: This is for testing only. In production, you should keep email verification enabled.

-- RECOMMENDED APPROACH: Disable email verification in Supabase Dashboard
-- Go to Authentication > Settings > User Management
-- and disable "Enable email confirmations"

-- ALTERNATIVE: Fix the existing test user (run the code below)

-- Check current status of test user
SELECT 
    id, 
    email, 
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'test@example.com';

-- Fix the test user by confirming their email
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'test@example.com' 
AND email_confirmed_at IS NULL;

-- Verify the fix
SELECT 
    id, 
    email, 
    email_confirmed_at,
    'Email is now confirmed' as status
FROM auth.users 
WHERE email = 'test@example.com';

-- If you need to create a NEW test user (different email), use this:
/*
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users with confirmed email
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'test2@example.com',  -- Different email
        crypt('testpassword123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Test User 2"}'
    );

    -- Create corresponding user profile
    INSERT INTO users (id, email, full_name, created_at, updated_at)
    VALUES (user_id, 'test2@example.com', 'Test User 2', NOW(), NOW());
    
    RAISE NOTICE 'New test user created with email: test2@example.com and password: testpassword123';
END $$;
*/