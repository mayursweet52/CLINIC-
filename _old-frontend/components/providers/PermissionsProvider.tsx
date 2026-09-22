'use client';

import React, { createContext, useContext } from 'react';

const PermissionsContext = createContext<{ role: string; permissions: string[] }>({ role: '', permissions: [] });

export function PermissionsProvider({ 
  role, 
  permissions, 
  children 
}: { 
  role: string; 
  permissions: string[]; 
  children: React.ReactNode 
}) {
  return (
    <PermissionsContext.Provider value={{ role, permissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const { role, permissions } = useContext(PermissionsContext);
  
  return {
    role,
    permissions,
    can: (permissionKey: string) => {
      if (role === 'ADMIN') return true;
      if (permissions.includes('*')) return true;
      if (permissions.includes(permissionKey)) return true;
      
      const parts = permissionKey.split(':');
      if (parts.length >= 2) {
        if (permissions.includes(`${parts[0]}:*`)) return true;
      }
      
      return false;
    }
  };
}
