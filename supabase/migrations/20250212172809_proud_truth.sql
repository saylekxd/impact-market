/*
  # Fix payments RLS policies

  1. Changes
    - Modify payments policies to avoid direct auth.users access
    - Simplify payment viewing logic
    - Add additional indexes for performance

  2. Security
    - Update RLS policies to be more secure
    - Maintain data privacy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view payments they sent or received" ON payments;
DROP POLICY IF EXISTS "Anyone can create payments" ON payments;

-- Create new policies with simplified logic
CREATE POLICY "Users can view received payments"
  ON payments FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Users can view sent payments"
  ON payments FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    payer_email = auth.jwt()->>'email'
  );

CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Add composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_creator_status_created
  ON payments(creator_id, status, created_at DESC);

-- Ensure status values are consistent
DO $$
BEGIN
  -- Standardize payment status values
  UPDATE payments
  SET status = CASE 
    WHEN status = 'success' THEN 'completed'
    WHEN status = 'failed' THEN 'error'
    ELSE status
  END
  WHERE status NOT IN ('pending', 'completed', 'error');
END $$;