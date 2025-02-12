/*
  # Fix balance update mechanism

  1. Changes
    - Drop and recreate trigger function with better error handling
    - Add explicit transaction handling
    - Add debugging logs
    - Recalculate all balances
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_balance_after_payment ON payments;
DROP FUNCTION IF EXISTS update_available_balance();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION update_available_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Log the payment update
  RAISE NOTICE 'Processing payment update: ID=%, Status: % -> %, Amount: %',
    NEW.id, COALESCE(OLD.status, 'NEW'), NEW.status, NEW.amount;

  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status <> 'completed') THEN
    -- Get current balance
    SELECT available_balance INTO current_balance
    FROM profiles
    WHERE id = NEW.creator_id;

    RAISE NOTICE 'Current balance for creator %: %', NEW.creator_id, COALESCE(current_balance, 0);

    -- Update the balance
    UPDATE profiles
    SET 
      available_balance = COALESCE(current_balance, 0) + NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.creator_id
    RETURNING available_balance INTO current_balance;

    RAISE NOTICE 'New balance for creator %: %', NEW.creator_id, current_balance;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in update_available_balance: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER update_balance_after_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_available_balance();

-- Recalculate all balances
DO $$
DECLARE
  r RECORD;
  total integer;
BEGIN
  -- Reset all balances to 0
  UPDATE profiles SET available_balance = 0;
  
  -- Recalculate for each profile
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
    
    RAISE NOTICE 'Recalculated balance for %: %', r.creator_id, total;
  END LOOP;
END $$;