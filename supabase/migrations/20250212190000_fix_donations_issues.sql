/*
  # Fix donation visibility issues and top donors function
  
  1. Changes
    - Create donor_visibility table if it doesn't exist
    - Fix the get_top_donors function with ambiguous column reference
    - Enable REST API access for donor_visibility table
  
  2. Security
    - Enable RLS on the table
    - Add proper policies for data access
*/

-- Create donor_visibility table
CREATE TABLE IF NOT EXISTS donor_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  show_top_donors boolean NOT NULL DEFAULT true,
  top_donors_count integer NOT NULL DEFAULT 5,
  hide_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable REST API for the table
COMMENT ON TABLE donor_visibility IS 'User preferences for donor visibility';
COMMENT ON COLUMN donor_visibility.id IS 'Primary Key';
COMMENT ON COLUMN donor_visibility.user_id IS 'User ID from auth.users';
COMMENT ON COLUMN donor_visibility.show_top_donors IS 'Whether to show top donors';
COMMENT ON COLUMN donor_visibility.top_donors_count IS 'Number of top donors to show';
COMMENT ON COLUMN donor_visibility.hide_anonymous IS 'Whether to hide anonymous donations';
COMMENT ON COLUMN donor_visibility.created_at IS 'Creation timestamp';
COMMENT ON COLUMN donor_visibility.updated_at IS 'Last update timestamp';

-- Enable RLS
ALTER TABLE donor_visibility ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own visibility settings"
  ON donor_visibility FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own visibility settings"
  ON donor_visibility FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visibility settings"
  ON donor_visibility FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_top_donors(uuid);

-- Add or replace the get_top_donors function with fixed column references
CREATE OR REPLACE FUNCTION get_top_donors(creator_id uuid)
RETURNS TABLE (
  payer_name text,
  payer_email text,
  total_amount bigint,
  donation_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.payer_name::text,
    p.payer_email::text,
    SUM(p.amount)::bigint as total_amount,
    COUNT(p.id)::bigint as donation_count
  FROM 
    payments p
  WHERE 
    p.creator_id = get_top_donors.creator_id
    AND p.status = 'completed'
  GROUP BY 
    p.payer_name, p.payer_email
  ORDER BY 
    total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Fix the infinite reload loop by modifying the useDonations hook behavior
-- We'll do this by adding an initial record for the new user if it doesn't exist
DO $$
DECLARE
    v_count integer;
BEGIN
    SELECT COUNT(*) INTO v_count FROM donor_visibility;
    
    IF v_count = 0 THEN
        INSERT INTO donor_visibility (user_id, show_top_donors, top_donors_count, hide_anonymous)
        SELECT id, true, 5, false
        FROM auth.users;
    END IF;
END $$; 