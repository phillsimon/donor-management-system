/*
  # Temporarily disable RLS on donors table
  
  1. Changes
    - Disable RLS on donors table to allow public access
    - Drop existing RLS policies that are no longer needed
  
  2. Security
    - WARNING: This is a temporary change for development
    - RLS will be re-enabled when authentication is added back
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

-- Disable RLS on donors table
ALTER TABLE donors DISABLE ROW LEVEL SECURITY;