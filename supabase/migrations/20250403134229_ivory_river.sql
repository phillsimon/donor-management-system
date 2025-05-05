/*
  # Update donors table RLS policies
  
  1. Changes
    - Drop existing policies
    - Add new policies to allow all authenticated users to:
      - Read all donors
      - Insert donors
      - Update donors
      - Delete donors
  
  2. Security
    - Enable RLS
    - Grant full access to authenticated users
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own donors" ON donors;
    DROP POLICY IF EXISTS "Users can read their own donors" ON donors;
    DROP POLICY IF EXISTS "Users can update their own donors" ON donors;
    DROP POLICY IF EXISTS "Users can delete their own donors" ON donors;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow authenticated users to read donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert donors"
  ON donors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update donors"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete donors"
  ON donors
  FOR DELETE
  TO authenticated
  USING (true);