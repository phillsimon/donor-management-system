/*
  # Update admin role assignment trigger
  
  1. Changes
    - Modify trigger function to assign admin role to all new users
    - Drop existing trigger and recreate with new logic
    - Assign admin role to all existing users
  
  2. Security
    - Maintains RLS policies
    - Ensures all users get admin access
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assign_admin_on_signup ON auth.users;

-- Update the trigger function to assign admin to all users
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Get admin role id and assign to new user
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, roles.id
  FROM roles
  WHERE roles.name = 'admin'
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER assign_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_admin_role();

-- Assign admin role to all existing users
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

-- Log the assignments for verification
DO $$
DECLARE
  assigned_count integer;
BEGIN
  SELECT COUNT(*) INTO assigned_count
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'admin';

  RAISE NOTICE 'Admin role assignments completed. % users now have admin role.', assigned_count;
END $$;