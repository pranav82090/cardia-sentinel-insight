-- Drop and recreate functions with proper security settings
DROP FUNCTION IF EXISTS public.delete_user();
DROP FUNCTION IF EXISTS public.reset_user_account(text);

-- Recreate delete_user function with proper security
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the ID of the user making the request
  user_id := auth.uid();
  
  -- Make sure we have a valid user
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user data (this should cascade to all related data)
  DELETE FROM public.profiles WHERE id = user_id;
  DELETE FROM public.heart_recordings WHERE user_id = user_id;
  DELETE FROM public.api_settings WHERE user_id = user_id;
  
  -- Return success
  RETURN true;
END;
$$;

-- Recreate reset_user_account function with proper security
CREATE OR REPLACE FUNCTION public.reset_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's data
  DELETE FROM public.heart_recordings WHERE user_id = auth.uid();
  DELETE FROM public.api_settings WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$;