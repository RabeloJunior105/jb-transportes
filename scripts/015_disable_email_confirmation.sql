-- Disable email confirmation requirement for Supabase Auth
-- This allows users to login immediately after signup without email confirmation

-- Update auth configuration to disable email confirmation
-- Note: This requires Supabase CLI or dashboard configuration
-- For now, we'll create a policy to allow unconfirmed users

-- Allow users to login even if email is not confirmed
-- This is done by updating the auth.users table policies
-- But since we can't directly modify auth.users, we'll handle this in the application

-- Create a function to handle user creation without email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user_no_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table immediately
  INSERT INTO public.profiles (id, first_name, last_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    NOW(),
    NOW()
  );
  
  -- Update the user to be confirmed automatically
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger that auto-confirms users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_no_confirmation();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
