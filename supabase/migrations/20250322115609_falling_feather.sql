/*
  # Add version control for analysis versions

  1. Changes
    - Add version_id to workflow_responses if not exists
    - Add indexes for performance
    - Add unique constraint for version tracking
    - Update RLS policies

  2. Security
    - Maintain RLS on analysis_versions table
    - Update policies for proper access control
*/

-- Add version_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflow_responses' 
    AND column_name = 'version_id'
  ) THEN
    ALTER TABLE workflow_responses 
    ADD COLUMN version_id uuid REFERENCES analysis_versions(id);
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'analysis_versions_donor_user_idx'
  ) THEN
    CREATE INDEX analysis_versions_donor_user_idx ON analysis_versions(donor_id, user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'analysis_versions_current_idx'
  ) THEN
    CREATE INDEX analysis_versions_current_idx ON analysis_versions(is_current);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'workflow_responses_version_idx'
  ) THEN
    CREATE INDEX workflow_responses_version_idx ON workflow_responses(version_id);
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'workflow_responses_version_unique'
  ) THEN
    ALTER TABLE workflow_responses
    ADD CONSTRAINT workflow_responses_version_unique 
    UNIQUE (donor_id, user_id, step_id, question_id, version_id);
  END IF;
END $$;

-- Ensure RLS is enabled and policies exist
ALTER TABLE analysis_versions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert their own versions" ON analysis_versions;
  DROP POLICY IF EXISTS "Users can read their own versions" ON analysis_versions;
  DROP POLICY IF EXISTS "Users can update their own versions" ON analysis_versions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can insert their own versions"
  ON analysis_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own versions"
  ON analysis_versions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own versions"
  ON analysis_versions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);