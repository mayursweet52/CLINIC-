'use client';

import { can, canAny, type Permission } from '@/lib/rbac';

interface PermissionGateProps {
  /** The role of the current user */
  role: string;
  /** Single permission or array (any match grants access) */
  permission: Permission | Permission[];
  children: React.ReactNode;
  /** Shown instead of children when permission is denied */
  fallback?: React.ReactNode;
}

/**
 * Client component that conditionally renders children based on RBAC.
 *
 * @example
 * <PermissionGate role={userRole} permission="appointment:create">
 *   <Button>Book Appointment</Button>
 * </PermissionGate>
 */
export function PermissionGate({ role, permission, children, fallback = null }: PermissionGateProps) {
  const allowed = Array.isArray(permission)
    ? canAny(role, permission)
    : can(role, permission);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
