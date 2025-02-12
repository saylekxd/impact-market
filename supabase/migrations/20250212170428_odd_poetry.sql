/*
  # System wypłat - tabele i polityki

  1. Nowe Tabele
    - `bank_accounts` - dane bankowe użytkowników
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key do profiles)
      - `account_number` (text)
      - `bank_name` (text)
      - `swift_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payouts` - wypłaty środków
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key do profiles)
      - `amount` (integer)
      - `status` (text)
      - `bank_account_id` (uuid, foreign key do bank_accounts)
      - `created_at` (timestamp)
      - `processed_at` (timestamp)
      - `admin_id` (uuid, foreign key do profiles)
    
    - `payout_logs` - logi operacji wypłat
      - `id` (uuid, primary key)
      - `payout_id` (uuid, foreign key do payouts)
      - `action` (text)
      - `details` (jsonb)
      - `performed_by` (uuid, foreign key do profiles)
      - `created_at` (timestamp)

  2. Zmiany w istniejących tabelach
    - Dodanie kolumny `available_balance` do tabeli `profiles`
    - Dodanie kolumny `payout_id` do tabeli `payments`

  3. Bezpieczeństwo
    - Włączenie RLS dla wszystkich nowych tabel
    - Dodanie polityk dostępu dla użytkowników i administratorów
*/

-- Dodanie kolumny available_balance do profiles (jeśli nie istnieje)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'available_balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN available_balance integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Utworzenie tabeli bank_accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  swift_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Utworzenie tabeli payouts
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  bank_account_id uuid REFERENCES bank_accounts(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  admin_id uuid REFERENCES profiles(id)
);

-- Utworzenie tabeli payout_logs
CREATE TABLE IF NOT EXISTS payout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid REFERENCES payouts(id) NOT NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  performed_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Dodanie kolumny payout_id do payments (jeśli nie istnieje)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'payout_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN payout_id uuid REFERENCES payouts(id);
  END IF;
END $$;

-- Włączenie RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_logs ENABLE ROW LEVEL SECURITY;

-- Polityki dla bank_accounts
CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Polityki dla payouts
CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request own payouts"
  ON payouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Polityki dla payout_logs
CREATE POLICY "Users can view own payout logs"
  ON payout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payouts
      WHERE payouts.id = payout_id
      AND payouts.user_id = auth.uid()
    )
  );

-- Funkcja do aktualizacji available_balance
CREATE OR REPLACE FUNCTION update_available_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE profiles
    SET available_balance = available_balance + NEW.amount
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger do aktualizacji available_balance po zakończonej płatności
DROP TRIGGER IF EXISTS update_balance_after_payment ON payments;
CREATE TRIGGER update_balance_after_payment
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (OLD.status <> 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION update_available_balance();