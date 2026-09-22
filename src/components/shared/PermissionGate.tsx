'use client';

import { usePermissions } from "@/components/providers/PermissionsProvider";

export function PermissionGate({ 
  permission, 
  children,
  fallback = null
}: { 
  permission: string; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();

  if (can(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
