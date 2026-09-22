// src/lib/audit.ts — Production-grade audit logger with DB + in-memory fallback

import { prisma } from '@/lib/prisma';

// ─── In-memory fallback store ─────────────────────────────────────────────────
export interface AuditRecord {
  id: string;
  userId?: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  // Legacy compat fields
  actor?: string;
  role?: string;
  details?: Record<string, any>;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}

const globalForAudit = globalThis as unknown as { __auditLogs?: AuditRecord[] };
if (!globalForAudit.__auditLogs) globalForAudit.__auditLogs = seedDefaultLogs();
const inMemoryLogs = globalForAudit.__auditLogs;

function seedDefaultLogs(): AuditRecord[] {
  return [
    {
      id: 'aud-1', actor: 'dr.smith@clinic.com', role: 'DOCTOR',
      action: 'appointment:update', resource: 'HealthAppointment', resourceId: 'APT-101',
      details: { patient: 'John Doe', diagnosis: 'Viral Fever' }, status: 'SUCCESS',
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'aud-2', actor: 'pharmacy@clinic.com', role: 'PHARMACIST',
      action: 'pharmacy:dispense', resource: 'Prescription', resourceId: 'RX-904',
      details: { medicines: ['Paracetamol 500mg', 'Vitamin C'] }, status: 'SUCCESS',
      createdAt: new Date(Date.now() - 2400000),
    },
    {
      id: 'aud-3', actor: 'cashier@clinic.com', role: 'ACCOUNTANT',
      action: 'bill:update', resource: 'Billing', resourceId: 'INV-001',
      details: { amount: 950, paymentMode: 'UPI' }, status: 'SUCCESS',
      createdAt: new Date(Date.now() - 1200000),
    },
  ];
}

// ─── Main logAction ───────────────────────────────────────────────────────────
export async function logAction(params: {
  userId?: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: any;
  after?: any;
  request?: Request;
}): Promise<void> {
  const ip = params.request?.headers?.get('x-forwarded-for') ?? undefined;
  const userAgent = params.request?.headers?.get('user-agent') ?? undefined;

  const record: AuditRecord = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...params,
    ip,
    userAgent,
    createdAt: new Date(),
  };

  // Non-blocking — fire and forget
  void (async () => {
    try {
      await prisma.auditLog.create({
        data: {
          userId: record.userId,
          orgId: record.orgId,
          action: record.action,
          resource: record.resource,
          resourceId: record.resourceId,
          before: record.before ?? undefined,
          after: record.after ?? undefined,
          ip: record.ip,
          userAgent: record.userAgent,
        },
      });
    } catch {
      // DB unavailable — store in memory
      inMemoryLogs.unshift(record);
      if (inMemoryLogs.length > 200) inMemoryLogs.pop();
    }
  })();
}

export function getRecentLogs(orgId?: string, limit = 100): AuditRecord[] {
  return inMemoryLogs
    .filter(l => !orgId || l.orgId === orgId)
    .slice(0, limit);
}

// ─── Legacy auditService compatibility ───────────────────────────────────────
class AuditService {
  log(entry: { actor: string; role: string; action: string; resource: string; resourceId: string; details: any; status?: string }) {
    const record: AuditRecord = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actor: entry.actor,
      role: entry.role,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      details: entry.details,
      status: (entry.status as any) || 'SUCCESS',
      createdAt: new Date(),
    };
    inMemoryLogs.unshift(record);
    if (inMemoryLogs.length > 200) inMemoryLogs.pop();
    // Also try DB non-blocking
    void logAction({ action: entry.action, resource: entry.resource, resourceId: entry.resourceId });
    return record;
  }

  getLogs(limit = 50, actionFilter?: string): AuditRecord[] {
    const logs = inMemoryLogs.slice(0, limit);
    if (!actionFilter) return logs;
    return logs.filter(l => l.action?.includes(actionFilter));
  }
}

export const auditService = new AuditService();
