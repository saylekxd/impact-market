/*
  # Add coffee amounts to profiles table

  1. Changes
    - Add columns for coffee amounts to profiles table:
      - small_coffee_amount (default 500 = 5 PLN)
      - medium_coffee_amount (default 1000 = 10 PLN)
      - large_coffee_amount (default 2000 = 20 PLN)
    - Add payment_type column to payments table
*/

-- Add coffee amount columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS small_coffee_amount integer NOT NULL DEFAULT 500,
ADD COLUMN IF NOT EXISTS medium_coffee_amount integer NOT NULL DEFAULT 1000,
ADD COLUMN IF NOT EXISTS large_coffee_amount integer NOT NULL DEFAULT 2000;

-- Add payment type column to payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_type text;