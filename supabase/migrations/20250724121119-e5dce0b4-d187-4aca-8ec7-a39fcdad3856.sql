-- Remove medius_api_key column from api_settings table
ALTER TABLE public.api_settings DROP COLUMN IF EXISTS medius_api_key;