/*
  # Add Date Searched field to donors table
  
  1. Changes
    - Add "Date Searched" column to donors table
    - Set default value to current timestamp
    - Allow NULL values for existing records
  
  2. Security
    - Maintains existing RLS policies
*/

-- Add Date Searched column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'Date Searched'
  ) THEN
    ALTER TABLE donors ADD COLUMN "Date Searched" timestamptz DEFAULT now();
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS donors_date_searched_idx ON donors("Date Searched");

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Added Date Searched column to donors table';
END $$;