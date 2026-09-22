// src/lib/withPermission.ts
// API route HOC — wraps a handler with JWT auth + RBAC permission check

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { can, type Permission } from '@/lib/rbac';

export interface AuthContext {
  userId: string;
  role: string;
  orgId: string;
  name: string;
}

type Handler = (req: Request, ctx: AuthContext) => Promise<Response>;

export function withPermission(permission: Permission, handler: Handler) {
  return async (req: Request): Promise<Response> => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345'
      );
      const { payload } = await jwtVerify(token, secret);

      const role   = (payload.role as string) || '';
      const userId = (payload.userId as string) || '';
      const orgId  = (payload.orgId as string) || '';
      const name   = (payload.name as string) || '';

      if (!can(role, permission)) {
        return NextResponse.json(
          { error: 'Forbidden', required: permission, yourRole: role },
          { status: 403 }
        );
      }

      return handler(req, { userId, role, orgId, name });
    } catch (err: any) {
      return NextResponse.json({ error: 'Unauthorized', detail: err.message }, { status: 401 });
    }
  };
}

/** Extract auth context without permission check — returns null if unauthenticated */
export async function getAuthContext(req?: Request): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345'
    );
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: (payload.userId as string) || '',
      role:   (payload.role as string) || '',
      orgId:  (payload.orgId as string) || '',
      name:   (payload.name as string) || '',
    };
  } catch {
    return null;
  }
}
