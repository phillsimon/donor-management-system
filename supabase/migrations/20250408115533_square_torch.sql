/*
  # Update RLS policies for donors table
  
  1. Changes
    - Drop existing policies
    - Create new policies that allow:
      - Users to read all donors
      - Users to manage their own donors
    - Add proper indexes
  
  2. Security
    - Enable RLS
    - Ensure proper access control
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow insert with donors.create permission" ON donors;
    DROP POLICY IF EXISTS "Allow read with donors.read permission" ON donors;
    DROP POLICY IF EXISTS "Allow update with donors.update permission" ON donors;
    DROP POLICY IF EXISTS "Allow delete with donors.delete permission" ON donors;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can read all donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own donors"
  ON donors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own donors"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own donors"
  ON donors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS donors_user_id_idx ON donors(user_id);
CREATE INDEX IF NOT EXISTS donors_client_id_idx ON donors("Client ID");
CREATE INDEX IF NOT EXISTS donors_user_id_created_at_idx ON donors(user_id, created_at DESC);

-- Log the changes
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'donors';
  
  RAISE NOTICE 'Updated RLS policies for donors table. Total policies: %', policy_count;
END $$;