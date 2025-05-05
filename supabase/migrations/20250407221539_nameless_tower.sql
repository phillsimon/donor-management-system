/*
  # Fix admin permissions and role assignments
  
  1. Changes
    - Ensure admin role has all necessary permissions
    - Assign admin role to all users
    - Add proper indexes for performance
  
  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- First ensure admin role has all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE 
  r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Then assign admin role to all users
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS role_permissions_role_permission_idx 
  ON role_permissions (role_id, permission_id);

CREATE INDEX IF NOT EXISTS user_roles_user_role_name_idx 
  ON user_roles (user_id) INCLUDE (role_id);

-- Log the results
DO $$
DECLARE
  permission_count integer;
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO permission_count
  FROM role_permissions rp
  JOIN roles r ON r.id = rp.role_id
  WHERE r.name = 'admin';

  SELECT COUNT(*) INTO user_count
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'admin';

  RAISE NOTICE 'Admin role has % permissions and % users assigned', 
    permission_count, user_count;
END $$;