-- Alter profiles table for Fractional Listings & TQM
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS engagement_type TEXT DEFAULT 'task',
ADD COLUMN IF NOT EXISTS hours_per_week INTEGER,
ADD COLUMN IF NOT EXISTS minimum_commitment_months INTEGER,
ADD COLUMN IF NOT EXISTS monthly_rate INTEGER,
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS completion_rate INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;

-- Alter listings table for TQM & Fractional
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS rating_average DOUBLE PRECISION DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS engagement_type TEXT DEFAULT 'task',
ADD COLUMN IF NOT EXISTS hours_per_week INTEGER,
ADD COLUMN IF NOT EXISTS minimum_commitment_months INTEGER,
ADD COLUMN IF NOT EXISTS monthly_rate INTEGER,
ADD COLUMN IF NOT EXISTS domain TEXT;
