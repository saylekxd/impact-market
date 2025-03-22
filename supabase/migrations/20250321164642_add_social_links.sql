-- Add social_links column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB;
