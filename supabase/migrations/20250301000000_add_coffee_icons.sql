/*
  # Add coffee icon columns to profiles table

  1. Changes
    - Add columns for coffee icon types to profiles table:
      - small_icon (default 'coffee')
      - medium_icon (default 'coffee')
      - large_icon (default 'coffee')
*/

-- Add coffee icon columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS small_icon text NOT NULL DEFAULT 'coffee',
ADD COLUMN IF NOT EXISTS medium_icon text NOT NULL DEFAULT 'coffee',
ADD COLUMN IF NOT EXISTS large_icon text NOT NULL DEFAULT 'coffee'; 