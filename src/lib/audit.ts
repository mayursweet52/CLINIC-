import { prisma } from './prisma';

export interface AuditLogParams {
  userId?: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: any;
  after?: any;
  req?: Request;
}

export function logAction(params: AuditLogParams) {
  // Fire and forget - never blocks
  Promise.resolve().then(async () => {
    try {
      let ip = null;
      let userAgent = null;

      if (params.req) {
        ip = params.req.headers.get('x-forwarded-for') || params.req.headers.get('x-real-ip');
        userAgent = params.req.headers.get('user-agent');
      }

      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          orgId: params.orgId,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId,
          before: params.before ? JSON.parse(JSON.stringify(params.before)) : null,
          after: params.after ? JSON.parse(JSON.stringify(params.after)) : null,
          ip: ip || null,
          userAgent: userAgent || null,
        }
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  });
}

// Legacy compatibility for older mocked logs
export const auditService = {
  log: (entry: any) => {
    logAction({
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      userId: entry.actor,
      after: entry.details,
    });
    return entry;
  },
  getLogs: () => []
};
