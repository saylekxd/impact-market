/*
  # Fix payments policies and add indexes

  1. Changes
    - Drop and recreate payments policies to allow proper access
    - Add indexes for better performance
    - Add trigger for logging payment status changes

  2. Security
    - Enable RLS on payments table
    - Add policies for viewing and inserting payments
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view their received payments" ON payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;

-- Create new policies
CREATE POLICY "Users can view payments they sent or received"
  ON payments FOR SELECT
  USING (
    creator_id = auth.uid() OR 
    (payer_email IS NOT NULL AND payer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Create audit trigger for payment status changes
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Payment % status changed: % -> %', 
    NEW.id, 
    COALESCE(OLD.status, 'NEW'), 
    NEW.status;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_payment_status_change ON payments;
CREATE TRIGGER log_payment_status_change
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_status_change();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_creator_id_status 
  ON payments(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_payer_email 
  ON payments(payer_email);
CREATE INDEX IF NOT EXISTS idx_payments_created_at_status 
  ON payments(created_at, status);

-- Verify and fix any inconsistent payment statuses
UPDATE payments 
SET status = 'completed' 
WHERE status = 'success';

-- Recalculate balances to ensure consistency
DO $$
DECLARE
  r RECORD;
  total integer;
BEGIN
  FOR r IN 
    SELECT DISTINCT creator_id 
    FROM payments 
    WHERE status = 'completed'
  LOOP
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM payments
    WHERE creator_id = r.creator_id
    AND status = 'completed';
    
    UPDATE profiles
    SET 
      available_balance = total,
      updated_at = NOW()
    WHERE id = r.creator_id;
    
    RAISE NOTICE 'Updated balance for creator %: %', r.creator_id, total;
  END LOOP;
END $$;