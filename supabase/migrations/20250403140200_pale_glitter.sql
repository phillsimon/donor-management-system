/*
  # Fix admin role assignment and RLS policies
  
  1. Changes
    - Update admin role assignment trigger
    - Add better error handling
    - Fix RLS policies
    - Add session handling improvements
  
  2. Security
    - Maintain RLS enabled
    - Ensure proper role assignments
*/

-- Update the trigger function with better error handling and logging
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id uuid;
  retry_count integer := 0;
  max_retries constant integer := 3;
BEGIN
  -- Get the admin role ID first
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found';
  END IF;

  -- Retry loop for role assignment
  WHILE retry_count < max_retries LOOP
    BEGIN
      INSERT INTO user_roles (user_id, role_id)
      VALUES (NEW.id, admin_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
      
      -- If we get here, the insert succeeded
      RAISE NOTICE 'Successfully assigned admin role to user % on attempt %', NEW.id, retry_count + 1;
      RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
      -- Log the error and retry
      RAISE WARNING 'Failed to assign admin role to user % (attempt %): %', 
        NEW.id, retry_count + 1, SQLERRM;
      retry_count := retry_count + 1;
      -- Small delay before retry
      PERFORM pg_sleep(0.5);
    END;
  END LOOP;
  
  -- If we get here, all retries failed
  RAISE WARNING 'Failed to assign admin role to user % after % attempts', NEW.id, max_retries;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS assign_admin_on_signup ON auth.users;

CREATE TRIGGER assign_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_admin_role();

-- Update RLS policies for better access control
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for admin role assignment" ON user_roles;
DROP POLICY IF EXISTS "Allow read access to user_roles" ON user_roles;

CREATE POLICY "Allow insert for admin role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow read access to user_roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS roles_name_idx ON roles(name);
CREATE INDEX IF NOT EXISTS user_roles_user_role_idx ON user_roles(user_id, role_id);

-- Verify and fix any missing role assignments
INSERT INTO user_roles (user_id, role_id)
SELECT 
  users.id,
  roles.id
FROM auth.users as users
CROSS JOIN roles
WHERE 
  roles.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = users.id
    AND user_roles.role_id = roles.id
  );

-- Log current status
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

  RAISE NOTICE 'Status: % admin role(s), % user(s), % admin assignment(s)', 
    role_count, user_count, assignment_count;
END $$;