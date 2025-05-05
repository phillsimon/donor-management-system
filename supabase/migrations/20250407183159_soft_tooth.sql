/*
  # Fix spouse name columns in donors table
  
  1. Changes
    - Rename spouse name columns to use correct format
    - Update indexes if needed
  
  2. Security
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Rename spouse name columns to use correct format
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'sp_first'
  ) THEN
    ALTER TABLE donors RENAME COLUMN "sp_first" TO "SP-First";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'sp_middle'
  ) THEN
    ALTER TABLE donors RENAME COLUMN "sp_middle" TO "SP-Middle";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'sp_last'
  ) THEN
    ALTER TABLE donors RENAME COLUMN "sp_last" TO "SP-Last";
  END IF;
END $$;