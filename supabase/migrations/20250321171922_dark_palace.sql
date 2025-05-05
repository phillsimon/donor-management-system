/*
  # Update workflow responses table and policies

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies with proper checks
    - Add indexes for performance
    - Update user profiles view

  2. Security
    - Maintain RLS on workflow_responses table
    - Update policies for proper access control
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own responses" ON workflow_responses;
    DROP POLICY IF EXISTS "Users can read all responses" ON workflow_responses;
    DROP POLICY IF EXISTS "Users can update their own responses" ON workflow_responses;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Ensure RLS is enabled
ALTER TABLE workflow_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_responses ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can insert their own responses"
  ON workflow_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all responses"
  ON workflow_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own responses"
  ON workflow_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS workflow_responses_donor_id_idx ON workflow_responses(donor_id);
CREATE INDEX IF NOT EXISTS workflow_responses_user_id_idx ON workflow_responses(user_id);
CREATE INDEX IF NOT EXISTS workflow_responses_created_at_idx ON workflow_responses(created_at);

-- Update user profiles view
DROP VIEW IF EXISTS user_profiles;

CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at,
  last_sign_in_at
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON user_profiles TO authenticated;