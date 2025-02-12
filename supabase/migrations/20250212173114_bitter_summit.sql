/*
  # Add total donations tracking

  1. Changes
    - Add total_donations column to profiles
    - Add functions and triggers to track total donations
    - Recalculate existing totals

  2. Security
    - Maintain existing RLS policies
*/

-- Add total_donations column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_donations integer NOT NULL DEFAULT 0;

-- Create function to calculate total donations
CREATE OR REPLACE FUNCTION calculate_total_donations(p_creator_id uuid)
RETURNS integer AS $$
DECLARE
  total integer;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM payments p
  WHERE p.creator_id = p_creator_id
  AND p.status = 'completed';
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Create function to update total donations
CREATE OR REPLACE FUNCTION update_total_donations()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_donations when payment status changes to completed
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
    UPDATE profiles
    SET 
      total_donations = calculate_total_donations(NEW.creator_id),
      updated_at = NOW()
    WHERE id = NEW.creator_id;
    
    RAISE NOTICE 'Updated total donations for creator %', NEW.creator_id;
  -- Update when payment is deleted or status changes from completed
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'completed') OR
        (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
    UPDATE profiles
    SET 
      total_donations = calculate_total_donations(OLD.creator_id),
      updated_at = NOW()
    WHERE id = OLD.creator_id;
    
    RAISE NOTICE 'Updated total donations for creator % after removal', OLD.creator_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for total donations
DROP TRIGGER IF EXISTS update_total_donations ON payments;
CREATE TRIGGER update_total_donations
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_total_donations();

-- Recalculate total donations for all profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM profiles
  LOOP
    UPDATE profiles
    SET 
      total_donations = calculate_total_donations(r.id),
      updated_at = NOW()
    WHERE id = r.id;
    
    RAISE NOTICE 'Recalculated total donations for profile %', r.id;
  END LOOP;
END $$;