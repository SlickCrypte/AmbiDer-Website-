-- Add linkedin_id to profiles for LinkedIn OAuth integration.
-- Stores the LinkedIn 'sub' (unique user identifier) from the OpenID Connect userinfo endpoint.
-- Used to match returning LinkedIn users and mark profiles as LinkedIn-verified.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS linkedin_id TEXT;

-- Create an index for fast lookups by linkedin_id during OAuth login
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_id
ON profiles (linkedin_id)
WHERE linkedin_id IS NOT NULL;
