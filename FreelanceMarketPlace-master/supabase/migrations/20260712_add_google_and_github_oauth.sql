-- Add google_id and github_id to profiles for OAuth integration.
-- Stores the unique identifier from Google (sub) and GitHub (id).

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS github_id TEXT;

-- Create indexes for fast lookups by google_id / github_id during OAuth login
CREATE INDEX IF NOT EXISTS idx_profiles_google_id
ON profiles (google_id)
WHERE google_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_github_id
ON profiles (github_id)
WHERE github_id IS NOT NULL;
