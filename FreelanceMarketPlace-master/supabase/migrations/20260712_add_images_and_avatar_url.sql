-- Alter profiles table to add avatar_url
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Alter listings table to add images array
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
