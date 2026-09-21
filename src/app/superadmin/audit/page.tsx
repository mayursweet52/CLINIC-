'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, Search, Filter, RefreshCw, CheckCircle, AlertTriangle, XCircle, User, FileText, Lock } from 'lucide-react';

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit?limit=100${filterAction ? `&action=${filterAction}` : ''}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const filteredLogs = logs.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      return (
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        (l.resourceId && l.resourceId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            ClinicOS Enterprise Audit Trail
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of all user activities, consultation events, billing transactions, and prescription actions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, action (e.g. CONSULTATION, DISPENSE), resource ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['', 'CONSULTATION', 'DISPENSE', 'INVOICE', 'APPOINTMENT'].map(act => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterAction === act
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {act === '' ? 'All Actions' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor / User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.actor}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-indigo-700">
                    {log.action}
                  </td>
                  <td className="p-4 text-slate-700">
                    <span className="font-semibold">{log.resource}</span>
                    {log.resourceId && (
                      <span className="ml-1 text-[10px] font-mono text-slate-400">({log.resourceId})</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="p-4 text-center">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-bold text-sm">
                    No matching audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
