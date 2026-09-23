import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getUserPermissions, can } from './rbac';

export function withPermission(permissionKey: string, handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;
      
      if (!token) {
        console.error("withPermission: No auth_token cookie found in request");
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
      const { payload } = await jwtVerify(token, secret);
      
      const userId = payload.userId as string;
      const role = payload.role as string;
      
      const userPerms = await getUserPermissions(userId);
      
      if (!can({ id: userId, role, permissions: userPerms }, permissionKey)) {
        console.error(`Forbidden: user ${userId} lacks ${permissionKey}. User perms:`, userPerms);
        return NextResponse.json({ error: 'Forbidden', required: permissionKey }, { status: 403 });
      }

      // We attach the user to the request context for the handler
      (request as any).user = { userId, role, orgId: payload.orgId };

      return handler(request, ...args);
    } catch (error) {
      console.error("Auth Error in withPermission:", error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
