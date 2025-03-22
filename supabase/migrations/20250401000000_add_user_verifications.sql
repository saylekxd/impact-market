-- Create user_verifications table
CREATE TABLE IF NOT EXISTS user_verifications (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  kyc_status TEXT,
  kyc_reference TEXT,
  kyc_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own verification status" ON user_verifications;
  DROP POLICY IF EXISTS "Users can update own verification status" ON user_verifications;
  DROP POLICY IF EXISTS "Users can insert own verification status" ON user_verifications;
END $$;

-- Create new policies
CREATE POLICY "Users can view own verification status"
  ON user_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own verification status"
  ON user_verifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification status"
  ON user_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_verifications_updated_at ON user_verifications;
CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at(); 