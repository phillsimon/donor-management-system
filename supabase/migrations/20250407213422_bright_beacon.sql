/*
  # Update role permissions for donor management
  
  1. Changes
    - Add donors.create permission to analyst role
    - Ensure all roles have proper donor management permissions
  
  2. Security
    - Maintains existing RLS policies
    - Updates role permissions safely
*/

-- Add donors.create permission to analyst role
WITH 
  analyst_role AS (SELECT id FROM roles WHERE name = 'analyst'),
  create_permission AS (SELECT id FROM permissions WHERE name = 'donors.create')
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  analyst_role.id,
  create_permission.id
FROM 
  analyst_role, create_permission
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = analyst_role.id
  AND rp.permission_id = create_permission.id
);

-- Verify permissions were added
DO $$
DECLARE
  permission_count integer;
BEGIN
  SELECT COUNT(*) INTO permission_count
  FROM role_permissions rp
  JOIN roles r ON r.id = rp.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE r.name = 'analyst' AND p.name = 'donors.create';

  RAISE NOTICE 'Analyst role now has % donors.create permission(s)', permission_count;
END $$;