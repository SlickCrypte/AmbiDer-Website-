-- Migration to add subcategory to profiles and listings for Find Talent and jobs filtering.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory TEXT;
