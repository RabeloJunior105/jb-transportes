-- Update profiles table to set default role and create admin user
-- Adding default role and creating first admin user

-- Set default role for existing users
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Create a default admin user (you can change this email)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@jbtransportes.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "JB Transportes"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding profile for admin user
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) 
SELECT 
  id,
  email,
  (raw_user_meta_data->>'first_name')::text,
  (raw_user_meta_data->>'last_name')::text,
  'admin',
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'admin@jbtransportes.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Allow users to view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON profiles;

CREATE POLICY "Allow users to view their own profiles or admins to view all" 
ON profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow users to update their own profiles or admins to update all" 
ON profiles FOR UPDATE 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
