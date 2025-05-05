/*
  # Create workflow responses tables

  1. New Tables
    - `workflow_responses`
      - `id` (uuid, primary key)
      - `donor_id` (text, required) - Reference to the donor
      - `user_id` (uuid, required) - Reference to the authenticated user
      - `step_id` (text, required) - The workflow step identifier
      - `question_id` (text, required) - The question identifier
      - `response` (text, required) - The user's response
      - `created_at` (timestamp with time zone) - When the response was created
      - `updated_at` (timestamp with time zone) - When the response was last updated

  2. Security
    - Enable RLS on workflow_responses table
    - Add policies for authenticated users to:
      - Insert their own responses
      - Read their own responses
      - Update their own responses
*/

CREATE TABLE workflow_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  step_id text NOT NULL,
  question_id text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflow_responses ENABLE ROW LEVEL SECURITY;

-- Policies for workflow_responses
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

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_workflow_responses_updated_at
  BEFORE UPDATE ON workflow_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();