/*
  # Create pings table for database activity monitoring
  
  1. New Tables
    - `_pings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `count` (integer, default 1)
  
  2. Security
    - Enable RLS on `_pings` table
    - Add policy for authenticated users to read data
*/

CREATE TABLE IF NOT EXISTS _pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  count integer DEFAULT 1
);

ALTER TABLE _pings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read pings"
  ON _pings
  FOR SELECT
  TO authenticated
  USING (true);