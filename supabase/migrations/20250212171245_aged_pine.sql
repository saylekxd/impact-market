/*
  # Create bank accounts and payouts tables

  1. New Tables
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `account_number` (text)
      - `bank_name` (text)
      - `swift_code` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (integer)
      - `status` (text)
      - `bank_account_id` (uuid, references bank_accounts)
      - `created_at` (timestamptz)
      - `processed_at` (timestamptz)
      - `admin_id` (uuid, references profiles)

    - `payout_logs`
      - `id` (uuid, primary key)
      - `payout_id` (uuid, references payouts)
      - `action` (text)
      - `details` (jsonb)
      - `performed_by` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for bank_accounts, payouts, and payout_logs
    - Add trigger for available_balance updates
*/

-- Add available_balance to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'available_balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN available_balance integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  swift_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  bank_account_id uuid REFERENCES bank_accounts(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  admin_id uuid REFERENCES profiles(id)
);

-- Create payout_logs table
CREATE TABLE IF NOT EXISTS payout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid REFERENCES payouts(id) NOT NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  performed_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Bank accounts policies
  DROP POLICY IF EXISTS "Users can view own bank accounts" ON bank_accounts;
  DROP POLICY IF EXISTS "Users can insert own bank accounts" ON bank_accounts;
  DROP POLICY IF EXISTS "Users can update own bank accounts" ON bank_accounts;
  
  -- Payouts policies
  DROP POLICY IF EXISTS "Users can view own payouts" ON payouts;
  DROP POLICY IF EXISTS "Users can request own payouts" ON payouts;
  
  -- Payout logs policies
  DROP POLICY IF EXISTS "Users can view own payout logs" ON payout_logs;
END $$;

-- Create new policies
CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request own payouts"
  ON payouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own payout logs"
  ON payout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payouts
      WHERE payouts.id = payout_id
      AND payouts.user_id = auth.uid()
    )
  );

-- Function to update available_balance
CREATE OR REPLACE FUNCTION update_available_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE profiles
    SET available_balance = available_balance + NEW.amount
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update available_balance after completed payment
DROP TRIGGER IF EXISTS update_balance_after_payment ON payments;
CREATE TRIGGER update_balance_after_payment
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (OLD.status <> 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION update_available_balance();