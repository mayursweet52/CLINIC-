'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, RefreshCw, Clock, User, Activity, Database, MemoryStick } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  userId?: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  // Legacy
  actor?: string;
  role?: string;
  details?: any;
  status?: string;
}

const ACTION_COLORS: Record<string, string> = {
  'appointment': 'bg-blue-100 text-blue-700',
  'patient':     'bg-green-100 text-green-700',
  'bill':        'bg-yellow-100 text-yellow-700',
  'pharmacy':    'bg-purple-100 text-purple-700',
  'user':        'bg-orange-100 text-orange-700',
  'settings':    'bg-red-100 text-red-700',
  'prescription':'bg-teal-100 text-teal-700',
};

function getActionColor(action: string): string {
  const category = action.split(':')[0];
  return ACTION_COLORS[category] || 'bg-gray-100 text-gray-700';
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'database' | 'memory'>('memory');
  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.logs || []);
      setSource(data.source || 'memory');
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all'
    ? logs
    : logs.filter(l => l.action?.startsWith(filter));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        description="Real-time system activity log — all sensitive actions recorded"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              {source === 'database'
                ? <><Database className="h-3 w-3 text-green-500" /> Database</>
                : <><MemoryStick className="h-3 w-3 text-yellow-500" /> Memory</>}
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="appointment">Appointments</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="bill">Billing</SelectItem>
            <SelectItem value="pharmacy">Pharmacy</SelectItem>
            <SelectItem value="prescription">Prescriptions</SelectItem>
            <SelectItem value="user">User Management</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Activity Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={8} cols={1} />
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Activity}
                title="No audit logs yet"
                description="Sensitive actions will appear here as they occur."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(log => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {log.resource}{log.resourceId ? ` #${log.resourceId.slice(-6)}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{log.actor || log.userId || 'System'}</span>
                        {(log.role || log.orgId) && (
                          <span className="border-l pl-3">{log.role || log.orgId}</span>
                        )}
                        {log.ip && <span className="border-l pl-3">{log.ip}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-7 sm:ml-0">
                    <Clock className="h-3 w-3" />
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
