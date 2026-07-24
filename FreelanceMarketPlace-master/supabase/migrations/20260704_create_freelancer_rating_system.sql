-- 1. Add is_rated column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_rated BOOLEAN DEFAULT FALSE;

-- 2. Add columns to reviews table for job-completion rating system
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
