/*
  # Update donors table RLS policies
  
  1. Changes
    - Drop existing policies
    - Create new policies that properly handle:
      - Regular users accessing their own donors
      - Admin users accessing all donors
    - Add indexes for better performance
  
  2. Security
    - Enable RLS
    - Ensure proper access control based on user roles
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert own donors" ON donors;
    DROP POLICY IF EXISTS "Users can read own donors" ON donors;
    DROP POLICY IF EXISTS "Users can update own donors" ON donors;
    DROP POLICY IF EXISTS "Users can delete own donors" ON donors;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create new policies with admin role check
CREATE POLICY "Users can insert own donors"
  ON donors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Users can read own donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id) OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Users can update own donors"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    (auth.uid() = user_id) OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Users can delete own donors"
  ON donors
  FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = user_id) OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS donors_user_id_idx ON donors(user_id);
CREATE INDEX IF NOT EXISTS donors_client_id_idx ON donors(client_id);
CREATE INDEX IF NOT EXISTS donors_user_id_created_at_idx ON donors(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS user_roles_user_role_name_idx ON user_roles(user_id) INCLUDE (role_id);

-- Verify current configuration
DO $$
DECLARE
  policy_count integer;
  index_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'donors';
  
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public' AND tablename = 'donors';
  
  RAISE NOTICE 'Configuration verified: % policies and % indexes on donors table', 
    policy_count, index_count;
END $$;