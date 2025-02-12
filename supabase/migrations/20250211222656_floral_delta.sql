/*
  # Initial Schema Setup for Creator Payment Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, matches auth.users id)
      - `username` (text, unique)
      - `display_name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payments`
      - `id` (uuid)
      - `creator_id` (uuid, references profiles)
      - `amount` (integer, in cents)
      - `currency` (text)
      - `status` (text)
      - `message` (text)
      - `payer_name` (text)
      - `payer_email` (text)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for profile management
    - Add policies for payment viewing
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'PLN',
  status text NOT NULL DEFAULT 'pending',
  message text,
  payer_name text,
  payer_email text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Payments policies
CREATE POLICY "Creators can view their received payments"
  ON payments FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Create function to handle username uniqueness check
CREATE OR REPLACE FUNCTION check_username_available(username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.username = check_username_available.username
  );
END;
$$;