// Central Enterprise Audit Logger for ClinicOS

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}

class AuditService {
  private logs: AuditRecord[] = [];
  private maxLogs = 200;

  constructor() {
    // Seed initial records for realism
    this.logs.push(
      {
        id: 'aud-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor: 'dr.smith@clinic.com',
        role: 'DOCTOR',
        action: 'CONSULTATION_COMPLETE',
        resource: 'Appointment',
        resourceId: 'APT-101',
        details: { patient: 'Sunil Deshmukh', prescriptionItems: 3, diagnosis: 'Acute Viral Pharyngitis' },
        status: 'SUCCESS'
      },
      {
        id: 'aud-2',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        actor: 'pharmacy@clinic.com',
        role: 'PHARMACIST',
        action: 'MEDICINE_DISPENSE',
        resource: 'Prescription',
        resourceId: 'RX-904',
        details: { patient: 'Sunil Deshmukh', medicines: ['Amoxicillin 500mg', 'Paracetamol 650mg'], stockDeducted: true },
        status: 'SUCCESS'
      },
      {
        id: 'aud-3',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        actor: 'cashier@clinic.com',
        role: 'ACCOUNTANT',
        action: 'INVOICE_PAID',
        resource: 'Billing',
        resourceId: 'INV-2026-001',
        details: { patient: 'Sunil Deshmukh', amount: 950, paymentMode: 'UPI' },
        status: 'SUCCESS'
      }
    );
  }

  log(entry: Omit<AuditRecord, 'id' | 'timestamp'> & { status?: 'SUCCESS' | 'WARNING' | 'FAILED' }): AuditRecord {
    const record: AuditRecord = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: entry.status || 'SUCCESS',
      ...entry
    };

    this.logs.unshift(record);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return record;
  }

  getLogs(limit = 50, actionFilter?: string): AuditRecord[] {
    if (!actionFilter) return this.logs.slice(0, limit);
    return this.logs.filter(l => l.action.includes(actionFilter)).slice(0, limit);
  }
}

const globalForAudit = globalThis as unknown as { __auditService?: AuditService };
export const auditService = globalForAudit.__auditService ?? new AuditService();
if (process.env.NODE_ENV !== 'production') {
  globalForAudit.__auditService = auditService;
}
