import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit')) || 50;
  const action = searchParams.get('action') || undefined;

  const logs = auditService.getLogs(limit, action);
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, role, action, resource, resourceId, details, status } = body;

    const record = auditService.log({
      actor: actor || 'system@clinic.com',
      role: role || 'STAFF',
      action: action || 'GENERIC_ACTION',
      resource: resource || 'System',
      resourceId,
      details: details || {},
      status: status || 'SUCCESS'
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
  }
}
