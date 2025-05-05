/*
  # Update donors table columns to match CSV names exactly
  
  1. Changes
    - Rename columns to use "#_" prefix for columns starting with "#"
    - Update column names to match CSV headers exactly
  
  2. Security
    - Maintain existing RLS policies
    - Preserve data during column renames
*/

DO $$ 
BEGIN
  -- Rename columns to match CSV headers exactly
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'num_of_gifts'
  ) THEN
    ALTER TABLE donors RENAME COLUMN num_of_gifts TO "# Of Gifts";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'num_of_prop'
  ) THEN
    ALTER TABLE donors RENAME COLUMN num_of_prop TO "# Of Prop";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'num_of_st_w_prop'
  ) THEN
    ALTER TABLE donors RENAME COLUMN num_of_st_w_prop TO "# of ST w/Prop";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donors' AND column_name = 'num_of_gift_matches'
  ) THEN
    ALTER TABLE donors RENAME COLUMN num_of_gift_matches TO "# Of Gift Matches";
  END IF;

  -- Update indexes to match new column names
  DROP INDEX IF EXISTS donors_num_of_gifts_idx;
  DROP INDEX IF EXISTS donors_num_of_prop_idx;
  DROP INDEX IF EXISTS donors_num_of_st_w_prop_idx;
  DROP INDEX IF EXISTS donors_num_gift_matches_idx;

  -- Create new indexes with updated column names
  CREATE INDEX IF NOT EXISTS donors_gifts_idx ON donors("# Of Gifts");
  CREATE INDEX IF NOT EXISTS donors_prop_idx ON donors("# Of Prop");
  CREATE INDEX IF NOT EXISTS donors_st_w_prop_idx ON donors("# of ST w/Prop");
  CREATE INDEX IF NOT EXISTS donors_gift_matches_idx ON donors("# Of Gift Matches");
END $$;