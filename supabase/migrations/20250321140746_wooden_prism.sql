/*
  # Update workflow responses table with RLS

  1. Changes
    - Create workflow_responses table if not exists
    - Add RLS policies if they don't exist
    - Add updated_at trigger

  2. Security
    - Enable RLS
    - Policies for authenticated users to:
      - Insert their own responses
      - Read their own responses
      - Update their own responses
*/

-- Create workflow_responses table
CREATE TABLE IF NOT EXISTS workflow_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  step_id text NOT NULL,
  question_id text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflow_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own responses" ON workflow_responses;
    DROP POLICY IF EXISTS "Users can read their own responses" ON workflow_responses;
    DROP POLICY IF EXISTS "Users can update their own responses" ON workflow_responses;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies
CREATE POLICY "Users can insert their own responses"
  ON workflow_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own responses"
  ON workflow_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON workflow_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_workflow_responses_updated_at ON workflow_responses;

-- Create trigger
CREATE TRIGGER update_workflow_responses_updated_at
  BEFORE UPDATE ON workflow_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();