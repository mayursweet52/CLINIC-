// src/lib/rbac.ts
// Pure in-code permission model — no DB needed for fast checks
// DB-backed permissions in Permission/RolePermission tables are for admin UI

export type Permission =
  | 'appointment:create'  | 'appointment:read'   | 'appointment:update' | 'appointment:delete'
  | 'patient:create'      | 'patient:read'        | 'patient:update'
  | 'prescription:create' | 'prescription:read'
  | 'bill:create'         | 'bill:read'           | 'bill:update'
  | 'pharmacy:dispense'   | 'pharmacy:inventory'
  | 'report:read'         | 'report:export'
  | 'user:manage'         | 'settings:manage';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  DOCTOR: [
    'appointment:read', 'appointment:update',
    'patient:read', 'patient:update',
    'prescription:create', 'prescription:read',
    'report:read',
  ],
  RECEPTIONIST: [
    'appointment:create', 'appointment:read', 'appointment:update',
    'patient:create', 'patient:read',
    'bill:read', 'bill:create', 'bill:update',
    'report:read',
  ],
  PHARMACIST: [
    'pharmacy:dispense', 'pharmacy:inventory',
    'appointment:read',
    'patient:read',
    'prescription:read',
  ],
  ADMIN: [
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete',
    'patient:create', 'patient:read', 'patient:update',
    'prescription:create', 'prescription:read',
    'bill:create', 'bill:read', 'bill:update',
    'pharmacy:dispense', 'pharmacy:inventory',
    'report:read', 'report:export',
    'user:manage', 'settings:manage',
  ],
  SUPERADMIN: [
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete',
    'patient:create', 'patient:read', 'patient:update',
    'prescription:create', 'prescription:read',
    'bill:create', 'bill:read', 'bill:update',
    'pharmacy:dispense', 'pharmacy:inventory',
    'report:read', 'report:export',
    'user:manage', 'settings:manage',
  ],
  PATIENT: [
    'appointment:read',
    'bill:read',
    'prescription:read',
  ],
};

/** Check if role has a single permission */
export function can(role: string, permission: Permission): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  const perms = ROLE_PERMISSIONS[normalized] ?? [];
  return perms.includes(permission);
}

/** Check if role has ALL of the given permissions */
export function canAll(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => can(role, p));
}

/** Check if role has ANY of the given permissions */
export function canAny(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => can(role, p));
}

/** Get all permissions for a role */
export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role.toUpperCase()] ?? [];
}

// ─── Prisma DB lookup (for admin UI) ─────────────────────────────────────────
import { prisma } from '@/lib/prisma';

const permCache = new Map<string, { perms: string[]; exp: number }>();

/** Get DB-backed permissions for a role with 60s cache */
export async function getDbPermissions(role: string): Promise<string[]> {
  const cached = permCache.get(role);
  if (cached && cached.exp > Date.now()) return cached.perms;

  try {
    const rps = await prisma.rolePermission.findMany({
      where: { role: role.toUpperCase() },
      include: { permission: true },
    });
    const perms = rps.map(rp => rp.permission.key);
    permCache.set(role, { perms, exp: Date.now() + 60_000 });
    return perms;
  } catch {
    // DB unavailable — fall back to code-defined permissions
    return getPermissions(role) as string[];
  }
}

// ─── Seed data for Permission + RolePermission tables ────────────────────────
export const ALL_PERMISSIONS: { key: Permission; description: string; category: string }[] = [
  { key: 'appointment:create',   description: 'Create appointments',        category: 'appointment'  },
  { key: 'appointment:read',     description: 'View appointments',          category: 'appointment'  },
  { key: 'appointment:update',   description: 'Update appointments',        category: 'appointment'  },
  { key: 'appointment:delete',   description: 'Delete appointments',        category: 'appointment'  },
  { key: 'patient:create',       description: 'Register new patients',      category: 'patient'      },
  { key: 'patient:read',         description: 'View patient records',       category: 'patient'      },
  { key: 'patient:update',       description: 'Update patient records',     category: 'patient'      },
  { key: 'prescription:create',  description: 'Create prescriptions',       category: 'prescription' },
  { key: 'prescription:read',    description: 'View prescriptions',         category: 'prescription' },
  { key: 'bill:create',          description: 'Create bills/invoices',      category: 'billing'      },
  { key: 'bill:read',            description: 'View bills/invoices',        category: 'billing'      },
  { key: 'bill:update',          description: 'Update billing status',      category: 'billing'      },
  { key: 'pharmacy:dispense',    description: 'Dispense medicines',         category: 'pharmacy'     },
  { key: 'pharmacy:inventory',   description: 'Manage medicine inventory',  category: 'pharmacy'     },
  { key: 'report:read',          description: 'View reports',               category: 'reports'      },
  { key: 'report:export',        description: 'Export reports',             category: 'reports'      },
  { key: 'user:manage',          description: 'Manage staff/users',         category: 'admin'        },
  { key: 'settings:manage',      description: 'Manage org settings',        category: 'admin'        },
];
