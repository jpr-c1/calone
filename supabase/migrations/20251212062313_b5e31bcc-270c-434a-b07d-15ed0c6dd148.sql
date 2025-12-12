-- Add google_refresh_token column to users table for persisting OAuth refresh tokens
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_refresh_token text;