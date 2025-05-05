/*
  # Temporarily disable RLS for development
  
  1. Changes
    - Disable RLS on donors table
    - Drop existing policies
    - Make user_id column nullable
  
  2. Security
    - WARNING: This is a temporary change for development
    - RLS will be re-enabled with proper policies later
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert own donors" ON donors;
    DROP POLICY IF EXISTS "Users can read own donors" ON donors;
    DROP POLICY IF EXISTS "Users can update own donors" ON donors;
    DROP POLICY IF EXISTS "Users can delete own donors" ON donors;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Disable RLS
ALTER TABLE donors DISABLE ROW LEVEL SECURITY;

-- Make user_id nullable for testing
ALTER TABLE donors ALTER COLUMN user_id DROP NOT NULL;