/*
  # Update donor table columns to match CSV headers exactly
  
  1. Changes
    - Rename columns to match CSV headers exactly
    - Add missing columns
    - Update column types where needed
  
  2. Security
    - Maintains existing RLS policies
    - Preserves data during column updates
*/

-- Rename columns to match CSV headers exactly
DO $$ 
BEGIN
  -- First check if we need to rename any columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'date_searched'
  ) THEN
    ALTER TABLE donors RENAME COLUMN date_searched TO "Date Searched";
  END IF;

  -- Add missing columns from CSV if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'User1'
  ) THEN
    ALTER TABLE donors 
    ADD COLUMN "User1" text,
    ADD COLUMN "User2" text,
    ADD COLUMN "User3" text,
    ADD COLUMN "User4" text,
    ADD COLUMN "User5" text,
    ADD COLUMN "User6" text,
    ADD COLUMN "User7" text,
    ADD COLUMN "User8" text,
    ADD COLUMN "User9" text,
    ADD COLUMN "User10" text,
    ADD COLUMN "User11" text,
    ADD COLUMN "User12" text,
    ADD COLUMN "User13" text,
    ADD COLUMN "User14" text,
    ADD COLUMN "User15" text,
    ADD COLUMN "User16" text,
    ADD COLUMN "User17" text,
    ADD COLUMN "User18" text,
    ADD COLUMN "User19" text,
    ADD COLUMN "User20" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'Email'
  ) THEN
    ALTER TABLE donors ADD COLUMN "Email" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'Assessed'
  ) THEN
    ALTER TABLE donors ADD COLUMN "Assessed" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'Assessment Questions'
  ) THEN
    ALTER TABLE donors ADD COLUMN "Assessment Questions" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'IRS 990PF'
  ) THEN
    ALTER TABLE donors ADD COLUMN "IRS 990PF" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'IRS PUB78'
  ) THEN
    ALTER TABLE donors ADD COLUMN "IRS PUB78" text;
  END IF;

  -- Rename any other columns that don't match CSV headers
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'democratic_gift_total'
  ) THEN
    ALTER TABLE donors RENAME COLUMN democratic_gift_total TO "Democratic Gift Amount";
  END IF;
END $$;