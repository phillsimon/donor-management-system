import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

// Cache configuration
const CACHE_KEY = 'rbac_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface CacheItem {
  timestamp: number;
  roles: Role[];
  permissions: Permission[];
}

const cache = new Map<string, CacheItem>();

const getCachedData = (userId: string) => {
  const cachedItem = cache.get(`${CACHE_KEY}_${userId}`);
  if (!cachedItem) return null;
  
  const isExpired = Date.now() - cachedItem.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(`${CACHE_KEY}_${userId}`);
    return null;
  }
  
  return cachedItem;
};

const setCachedData = (userId: string, roles: Role[], permissions: Permission[]) => {
  cache.set(`${CACHE_KEY}_${userId}`, {
    timestamp: Date.now(),
    roles,
    permissions
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useRBAC() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserRolesAndPermissions = async (retryCount = 0) => {
      try {
        // Check cache first
        const cachedData = getCachedData(user.id);
        if (cachedData) {
          setRoles(cachedData.roles);
          setPermissions(cachedData.permissions);
          setLoading(false);
          return;
        }

        // Fetch user's roles with optimized query
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            role:roles (
              id,
              name,
              description,
              role_permissions!inner (
                permission:permissions (
                  id,
                  name,
                  description
                )
              )
            )
          `)
          .eq('user_id', user.id);

        if (rolesError) throw rolesError;

        // Extract unique roles and permissions
        const uniqueRoles = new Map<string, Role>();
        const uniquePermissions = new Map<string, Permission>();

        userRoles?.forEach(userRole => {
          const role = userRole.role;
          if (role) {
            uniqueRoles.set(role.id, {
              id: role.id,
              name: role.name,
              description: role.description
            });

            role.role_permissions?.forEach(rp => {
              if (rp.permission) {
                uniquePermissions.set(rp.permission.id, {
                  id: rp.permission.id,
                  name: rp.permission.name,
                  description: rp.permission.description
                });
              }
            });
          }
        });

        const rolesList = Array.from(uniqueRoles.values());
        const permissionsList = Array.from(uniquePermissions.values());

        // Update cache
        setCachedData(user.id, rolesList, permissionsList);

        setRoles(rolesList);
        setPermissions(permissionsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching RBAC data:', err);
        
        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY * (retryCount + 1));
          return fetchUserRolesAndPermissions(retryCount + 1);
        }
        
        setError(err instanceof Error ? err.message : 'Failed to fetch roles and permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRolesAndPermissions();
  }, [user]);

  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  };

  const hasPermission = (permissionName: string): boolean => {
    return permissions.some(permission => permission.name === permissionName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permissionName => hasPermission(permissionName));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permissionName => hasPermission(permissionName));
  };

  return {
    roles,
    permissions,
    loading,
    error,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions
  };
}