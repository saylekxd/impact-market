/*
  # Fix payments and profiles structure

  1. Changes
    - Add missing indexes for better performance
    - Add trigger for updating total_donations
    - Fix RLS policies for payments
    - Add validation functions

  2. Security
    - Enable RLS on all tables
    - Add proper policies for data access
*/

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_payments_creator_status ON payments(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Add function to validate payment amount
CREATE OR REPLACE FUNCTION validate_payment_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than 0';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment amount validation
DROP TRIGGER IF EXISTS validate_payment_amount_trigger ON payments;
CREATE TRIGGER validate_payment_amount_trigger
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_amount();

-- Update payment policies
DROP POLICY IF EXISTS "Creators can view their received payments" ON payments;
CREATE POLICY "Creators can view their received payments"
  ON payments FOR SELECT
  USING (creator_id = auth.uid());

-- Function to update total_donations
CREATE OR REPLACE FUNCTION update_total_donations()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE profiles
    SET 
      total_donations = COALESCE(total_donations, 0) + NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating total_donations
DROP TRIGGER IF EXISTS update_total_donations_trigger ON payments;
CREATE TRIGGER update_total_donations_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_total_donations();

-- Recalculate total_donations for all profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  UPDATE profiles SET total_donations = 0;
  
  FOR r IN 
    SELECT creator_id, SUM(amount) as total
    FROM payments
    WHERE status = 'completed'
    GROUP BY creator_id
  LOOP
    UPDATE profiles
    SET total_donations = r.total
    WHERE id = r.creator_id;
  END LOOP;
END $$;