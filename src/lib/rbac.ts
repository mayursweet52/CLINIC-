import { prisma } from './prisma';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const cacheKey = `user_perms:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) return [];

    const rolePerms = await prisma.rolePermission.findMany({
      where: { roleId: user.role },
      include: { permission: true }
    });

    const perms = rolePerms.map((rp: any) => rp.permission.key);
    
    // Ensure admin gets wildcard
    if (user.role === 'ADMIN' && !perms.includes('*')) {
      perms.push('*');
    }

    await redis.set(cacheKey, JSON.stringify(perms), 'EX', 60);
    return perms;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

const DEFAULT_ROLE_PERMS: Record<string, string[]> = {
  ADMIN: ['*'],
  SUPERADMIN: ['*'],
  DOCTOR: ['patient:*', 'appointment:*', 'visit:*', 'prescription:*', 'record:*', 'doctor:*'],
  RECEPTIONIST: ['patient:*', 'appointment:*', 'billing:*', 'reception:*', 'record:*'],
  PHARMACIST: ['pharmacy:*', 'inventory:*', 'prescription:*', 'medicine:*']
};

export function can(user: { id?: string; role?: string; permissions?: string[] }, permissionKey: string): boolean {
  if (!user) return false;
  const role = user.role?.toUpperCase() || '';
  if (role === 'ADMIN' || role === 'SUPERADMIN') return true;
  
  const roleDefaults = DEFAULT_ROLE_PERMS[role] || [];
  const perms = [...(user.permissions || []), ...roleDefaults];

  if (perms.includes('*')) return true;
  if (perms.includes(permissionKey)) return true;

  const parts = permissionKey.split(':');
  if (parts.length >= 2) {
    const resourceWildcard = `${parts[0]}:*`;
    if (perms.includes(resourceWildcard)) return true;
  }

  return false;
}
