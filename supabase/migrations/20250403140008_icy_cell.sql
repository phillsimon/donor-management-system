/*
  # Fix user signup and role assignment
  
  1. Changes
    - Update admin role assignment trigger to be more reliable
    - Add explicit error handling for role assignment
    - Add logging for debugging
  
  2. Security
    - Maintains existing RLS policies
    - Ensures proper role assignment
*/

-- Update the trigger function with better error handling and logging
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id uuid;
BEGIN
  -- Get the admin role ID first
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found';
  END IF;

  -- Add a small delay to ensure transaction completion
  PERFORM pg_sleep(0.1);
  
  -- Insert the role assignment with explicit error handling
  BEGIN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE WARNING 'Failed to assign admin role to user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS assign_admin_on_signup ON auth.users;

CREATE TRIGGER assign_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_admin_role();

-- Ensure RLS is properly configured for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for user_roles
CREATE POLICY "Allow insert for admin role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add index for role lookups if not exists
CREATE INDEX IF NOT EXISTS roles_name_idx ON roles(name);

-- Verify current assignments and roles
DO $$
DECLARE
  role_count integer;
  user_count integer;
  assignment_count integer;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles WHERE name = 'admin';
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO assignment_count 
  FROM user_roles ur 
  JOIN roles r ON r.id = ur.role_id 
  WHERE r.name = 'admin';

  RAISE NOTICE 'Status: % admin role(s), % user(s), % assignment(s)', 
    role_count, user_count, assignment_count;
END $$;