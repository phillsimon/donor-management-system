/*
  # Update RLS policies for donors table
  
  1. Changes
    - Drop and recreate RLS policies with proper user_id checks
    - Add permission-based access control
    - Add indexes for better performance
  
  2. Security
    - Enable RLS
    - Ensure proper access control based on permissions
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow insert with donors.create permission" ON donors;
    DROP POLICY IF EXISTS "Allow read with donors.read permission" ON donors;
    DROP POLICY IF EXISTS "Allow update with donors.update permission" ON donors;
    DROP POLICY IF EXISTS "Allow delete with donors.delete permission" ON donors;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create new policies with user_id checks
CREATE POLICY "Allow insert with donors.create permission"
  ON donors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'donors.create'
    )
  );

CREATE POLICY "Allow read with donors.read permission"
  ON donors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'donors.read'
    )
  );

CREATE POLICY "Allow update with donors.update permission"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'donors.update'
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'donors.update'
    )
  );

CREATE POLICY "Allow delete with donors.delete permission"
  ON donors
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'donors.delete'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS donors_user_id_idx ON donors(user_id);
CREATE INDEX IF NOT EXISTS donors_client_id_idx ON donors("Client ID");
CREATE INDEX IF NOT EXISTS donors_user_id_created_at_idx ON donors(user_id, created_at DESC);

-- Log the changes
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'donors';
  
  RAISE NOTICE 'Updated RLS policies for donors table. Total policies: %', policy_count;
END $$;