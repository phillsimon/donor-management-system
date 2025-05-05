/*
  # Update user authentication and role assignment
  
  1. Changes
    - Drop user_profiles view as it's not needed for auth
    - Update admin role assignment trigger to be more robust
    - Add indexes for better performance
  
  2. Security
    - Maintains RLS policies
    - Ensures proper role assignment
*/

-- Drop user_profiles view as we'll use auth.users directly
DROP VIEW IF EXISTS user_profiles;

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Add a small delay to ensure the user is fully created
  PERFORM pg_sleep(0.5);
  
  -- Get admin role id and assign to new user
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, roles.id
  FROM roles
  WHERE roles.name = 'admin'
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS roles_name_idx ON roles(name);
CREATE INDEX IF NOT EXISTS user_roles_user_role_idx ON user_roles(user_id, role_id);

-- Log the current role assignments
DO $$
DECLARE
  assigned_count integer;
BEGIN
  SELECT COUNT(*) INTO assigned_count
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'admin';

  RAISE NOTICE 'Current admin role assignments: %', assigned_count;
END $$;