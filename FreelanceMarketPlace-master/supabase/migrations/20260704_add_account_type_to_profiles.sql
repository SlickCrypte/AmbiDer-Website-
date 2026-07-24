-- Add account_type to profiles for signup, profile setup, and Find Talent filtering.
--
-- Supported values:
--   client            - hiring clients (not shown on Find Talent)
--   seller_only       - product sellers only (hidden from Find Talent)
--   freelancer_seller - freelance service providers (shown on Find Talent)
--
-- Existing rows receive freelancer_seller via the column default.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'freelancer_seller';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_account_type_check'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_account_type_check
    CHECK (account_type IN ('client', 'seller_only', 'freelancer_seller'));
  END IF;
END $$;
