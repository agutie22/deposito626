-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create an Admin User in auth.users
-- Password is 'Yz6vxc@3'
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@deposito626.com',
    crypt('Yz6vxc@3', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO UPDATE SET 
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    updated_at = current_timestamp;

-- 2. Create the Admin Profile
-- Note: We didn't add a trigger to auto-create profiles in the migration, 
-- needs to be manual or triggered. For seed, we insert manually.
INSERT INTO public.profiles (id, role)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. Ensure Store Settings exist (id=1)
INSERT INTO public.store_settings (id, is_open, closing_message)
VALUES (1, false, 'We are currently closed.')
ON CONFLICT (id) DO NOTHING;
