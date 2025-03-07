/*
  # Add external reference column to payments table

  1. Changes
    - Add external_reference column to store third-party payment references (like Stripe payment IDs)
    - Create index for faster lookups by reference

  2. Security
    - No changes to existing security policies
*/

-- Add external_reference column to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS external_reference text;

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_external_reference 
ON payments(external_reference);

-- Ensure we can query payments by multiple criteria
CREATE INDEX IF NOT EXISTS idx_payments_type_reference
ON payments(payment_type, external_reference); 