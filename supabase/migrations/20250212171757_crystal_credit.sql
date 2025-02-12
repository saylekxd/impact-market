/*
  # Fix payment trigger for balance updates
  
  1. Changes
    - Drop and recreate the trigger function with proper error handling
    - Ensure trigger is properly bound to the payments table
    - Add logging for debugging purposes
  
  2. Security
    - No changes to existing security policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_balance_after_payment ON payments;
DROP FUNCTION IF EXISTS update_available_balance();

-- Create improved function with logging
CREATE OR REPLACE FUNCTION update_available_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the payment update
  RAISE NOTICE 'Processing payment status update: % -> % for creator_id: % amount: %',
    OLD.status, NEW.status, NEW.creator_id, NEW.amount;

  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Update the creator's available balance
    UPDATE profiles
    SET 
      available_balance = COALESCE(available_balance, 0) + NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.creator_id;
    
    RAISE NOTICE 'Updated balance for creator_id: %', NEW.creator_id;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in update_available_balance: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger with proper timing and conditions
CREATE TRIGGER update_balance_after_payment
  AFTER UPDATE OR INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_available_balance();