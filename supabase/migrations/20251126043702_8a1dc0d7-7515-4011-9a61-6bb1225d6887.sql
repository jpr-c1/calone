-- Add email and google_id columns to users table
ALTER TABLE public.users 
  ADD COLUMN email text UNIQUE,
  ADD COLUMN google_id text UNIQUE;

-- Delete the seed users (real users will be created on login)
DELETE FROM public.users;

-- Make email and google_id required for new users
ALTER TABLE public.users 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN google_id SET NOT NULL;