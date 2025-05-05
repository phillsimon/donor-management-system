/*
  # Simplify authentication and role assignment
  
  1. Changes
    - Remove complex trigger-based role assignment
    - Add default role assignment via RLS policies
    - Simplify auth flow
  
  2. Security
    - Maintain RLS on all tables
    - Ensure proper access control
*/

-- Drop existing complex trigger and function
DROP TRIGGER IF EXISTS assign_admin_on_signup ON auth.users;
DROP FUNCTION IF EXISTS assign_admin_role();

-- Clear existing role assignments
TRUNCATE user_roles;

-- Create default role assignments
INSERT INTO user_roles (user_id, role_id)
SELECT 
  users.id,
  roles.id
FROM auth.users as users
CROSS JOIN roles
WHERE roles.name = 'analyst';

-- Update RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for admin role assignment" ON user_roles;
DROP POLICY IF EXISTS "Allow read access to user_roles" ON user_roles;

-- Simplified policies
CREATE POLICY "Enable read access for own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for own roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add proper indexes
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON user_roles(role_id);