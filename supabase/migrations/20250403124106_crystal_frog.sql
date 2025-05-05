/*
  # Update _pings table policies
  
  1. Changes
    - Drop existing policies
    - Add new policies for authenticated users to:
      - Read pings
      - Insert pings
  
  2. Security
    - Enable RLS
    - Restrict access to authenticated users only
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to read pings" ON _pings;
    DROP POLICY IF EXISTS "Allow authenticated users to insert pings" ON _pings;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE _pings ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow authenticated users to read pings"
  ON _pings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert pings"
  ON _pings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);