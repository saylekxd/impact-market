/*
  # Fix payments display and permissions
  
  1. Changes
    - Add missing indexes for better query performance
    - Update RLS policies for payments table
    - Add missing policies for completed payments
    - Fix available_balance calculations
  
  2. Security
    - Enhanced RLS policies for payments
    - Added policies for viewing completed payments
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_creator_id ON payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Drop existing payments policies
DROP POLICY IF EXISTS "Creators can view their received payments" ON payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;

-- Create new, more specific policies
CREATE POLICY "Creators can view their received payments"
  ON payments FOR SELECT
  USING (
    auth.uid() = creator_id 
    AND (status = 'completed' OR status = 'pending')
  );

CREATE POLICY "Anyone can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Recalculate available balance for all users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT creator_id FROM payments WHERE status = 'completed'
  LOOP
    UPDATE profiles
    SET available_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE creator_id = r.creator_id
      AND status = 'completed'
    )
    WHERE id = r.creator_id;
  END LOOP;
END $$;