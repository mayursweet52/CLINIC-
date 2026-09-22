import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getRecentLogs } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    const orgId = payload.orgId as string | undefined;

    try {
      const logs = await prisma.auditLog.findMany({
        where: orgId ? { orgId } : {},
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ logs, source: 'database' });
    } catch {
      // DB unavailable — use in-memory logs
      const logs = getRecentLogs(orgId, 100);
      return NextResponse.json({ logs, source: 'memory' });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
