/*
  # Assign admin role to initial user
  
  1. Changes
    - Create function to assign admin role to a user
    - Create trigger to automatically assign admin role to the first user
    - Add admin role assignment to existing user if present
*/

-- Function to assign admin role to a user
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    -- Get admin role id
    INSERT INTO user_roles (user_id, role_id)
    SELECT NEW.id, roles.id
    FROM roles
    WHERE roles.name = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS assign_admin_on_signup ON auth.users;
CREATE TRIGGER assign_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_admin_role();

-- Assign admin role to existing user if they're the only one
INSERT INTO user_roles (user_id, role_id)
SELECT 
  users.id,
  roles.id
FROM auth.users as users
CROSS JOIN roles
WHERE 
  roles.name = 'admin'
  AND (SELECT COUNT(*) FROM auth.users) = 1
  AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = users.id
  );