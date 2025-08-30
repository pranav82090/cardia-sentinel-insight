-- Fix function search path security issues for database functions
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

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