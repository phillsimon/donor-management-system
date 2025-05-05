/*
  # Clean up duplicates and add unique constraint to workflow_responses
  
  1. Changes
    - Remove duplicate responses keeping only the latest version
    - Add unique constraint for donor_id, user_id, step_id, and question_id combination
    - Add supporting index for performance
  
  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity with unique responses
*/

-- First, create a temporary table with the latest responses
CREATE TEMP TABLE latest_responses AS
SELECT DISTINCT ON (donor_id, user_id, step_id, question_id)
  id,
  donor_id,
  user_id,
  step_id,
  question_id,
  response,
  created_at,
  updated_at
FROM workflow_responses
ORDER BY donor_id, user_id, step_id, question_id, updated_at DESC;

-- Delete all rows from workflow_responses
DELETE FROM workflow_responses;

-- Insert back only the latest version of each response
INSERT INTO workflow_responses
SELECT * FROM latest_responses;

-- Drop the temporary table
DROP TABLE latest_responses;

-- Now add the unique constraint
ALTER TABLE workflow_responses 
ADD CONSTRAINT workflow_responses_unique_response 
UNIQUE (donor_id, user_id, step_id, question_id);

-- Add supporting index for better performance
CREATE INDEX IF NOT EXISTS workflow_responses_composite_key_idx 
ON workflow_responses (donor_id, user_id, step_id, question_id);