-- Add is_read and read_at to order_messages
ALTER TABLE order_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE order_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Add 'other' to listing_category enum
-- Note: In PostgreSQL, you can't easily add values to an enum inside a transaction in some versions, 
-- but Supabase usually allows it.
ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'other';
