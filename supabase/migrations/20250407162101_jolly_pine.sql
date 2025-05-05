/*
  # Add missing gift matches column

  1. Changes
    - Add `num_of_gift_matches` column to donors table
    - Set default value to 0 for consistency
    - Allow NULL values to maintain compatibility with existing data

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Safe to run multiple times
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'num_of_gift_matches'
  ) THEN
    ALTER TABLE donors ADD COLUMN num_of_gift_matches INTEGER DEFAULT 0;
  END IF;
END $$;