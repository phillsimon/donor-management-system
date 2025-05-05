/*
  # Add Role-Based Access Control Schema
  
  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Role name (e.g., admin, manager, analyst)
      - `description` (text) - Role description
      - `created_at` (timestamptz)
    
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `role_id` (uuid) - References roles
      - `created_at` (timestamptz)
    
    - `permissions`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Permission name
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `role_permissions`
      - `id` (uuid, primary key)
      - `role_id` (uuid) - References roles
      - `permission_id` (uuid) - References permissions
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Add default roles and permissions
*/

-- Create roles table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to user_roles" ON user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to role_permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('manager', 'Manage donors and analysis'),
  ('analyst', 'View and analyze donors');

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
  ('donors.create', 'Create new donors'),
  ('donors.read', 'View donor information'),
  ('donors.update', 'Update donor information'),
  ('donors.delete', 'Delete donors'),
  ('analysis.create', 'Create donor analysis'),
  ('analysis.read', 'View donor analysis'),
  ('analysis.update', 'Update donor analysis'),
  ('analysis.delete', 'Delete donor analysis'),
  ('users.manage', 'Manage user accounts'),
  ('roles.manage', 'Manage roles and permissions');

-- Assign permissions to roles
WITH 
  admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
  manager_role AS (SELECT id FROM roles WHERE name = 'manager'),
  analyst_role AS (SELECT id FROM roles WHERE name = 'analyst')
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  admin_role.id,
  permissions.id
FROM admin_role, permissions;

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  manager_role.id,
  permissions.id
FROM 
  (SELECT id FROM roles WHERE name = 'manager') manager_role,
  permissions
WHERE 
  permissions.name IN (
    'donors.create', 'donors.read', 'donors.update',
    'analysis.create', 'analysis.read', 'analysis.update'
  );

-- Analyst permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  analyst_role.id,
  permissions.id
FROM 
  (SELECT id FROM roles WHERE name = 'analyst') analyst_role,
  permissions
WHERE 
  permissions.name IN (
    'donors.read',
    'analysis.create', 'analysis.read'
  );

-- Create indexes for better performance
CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX user_roles_role_id_idx ON user_roles(role_id);
CREATE INDEX role_permissions_role_id_idx ON role_permissions(role_id);
CREATE INDEX role_permissions_permission_id_idx ON role_permissions(permission_id);