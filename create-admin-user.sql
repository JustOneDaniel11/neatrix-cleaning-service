-- Create Admin User for Neatrix Admin Dashboard
-- Email: contactneatrix@gmail.com
-- Password: RelaxwithDan_11_123456@JustYou

-- This script creates an admin user in Supabase Auth
-- Run this in your Supabase SQL Editor or via psql

-- Insert the admin user into auth.users table
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'contactneatrix@gmail.com',
    crypt('RelaxwithDan_11_123456@JustYou', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Neatrix Admin"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
);

-- Insert corresponding identity record
INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    'contactneatrix@gmail.com',
    (SELECT id FROM auth.users WHERE email = 'contactneatrix@gmail.com'),
    '{"sub": "contactneatrix@gmail.com", "email": "contactneatrix@gmail.com", "email_verified": true, "phone_verified": false}',
    'email',
    NOW(),
    NOW(),
    NOW()
);

-- Optional: Create a profile record if you have a profiles table
-- Uncomment and modify based on your schema
/*
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'contactneatrix@gmail.com'),
    'contactneatrix@gmail.com',
    'Neatrix Admin',
    'admin',
    NOW(),
    NOW()
);
*/

-- Verify the user was created successfully
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'contactneatrix@gmail.com';