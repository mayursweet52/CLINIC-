"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SplitPane } from "@/components/shared/SplitPane";
import { InspectorPanel } from "@/components/shared/InspectorPanel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldAlert, Activity, FileSignature, Database, UserCog } from "lucide-react";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const mockData = [
    { id: '1', time: '2026-09-22 10:30', user: 'vikram@clinic.com', action: 'UPDATE', resource: 'Patient/123', ip: '192.168.1.1', diff: { before: { status: 'active' }, after: { status: 'inactive' } } },
    { id: '2', time: '2026-09-22 10:35', user: 'ananya@clinic.com', action: 'CREATE', resource: 'Prescription/456', ip: '192.168.1.5', diff: { before: null, after: { medicine: 'Paracetamol', dose: '500mg' } } },
    { id: '3', time: '2026-09-22 10:40', user: 'kavita@clinic.com', action: 'DELETE', resource: 'Appointment/789', ip: '192.168.1.10', diff: { before: { time: '14:00', patient: 'John Doe' }, after: null } },
  ];

  const filteredData = mockData.filter(item => {
    if (actionFilter !== "all" && item.action !== actionFilter) return false;
    if (search && !item.user.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const renderMain = () => (
    <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/20 flex gap-4 items-center bg-surface-lowest">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input 
            placeholder="Search by user email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-low border-outline-variant/30 text-on-surface focus-visible:ring-primary-500" 
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px] bg-surface-low border-outline-variant/30">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Resource</th>
              <th className="px-6 py-4 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredData.map((log) => {
              const color = log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
              return (
                <tr 
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4 font-medium text-on-surface">{log.user}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider ${color}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{log.resource}</td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">{log.ip}</td>
                </tr>
              )
            })}
            {filteredData.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInspector = () => {
    if (!selectedLog) return (
      <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center h-64">
        <div className="w-12 h-12 bg-surface-low rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <FileSignature className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-on-surface">No Event Selected</h3>
        <p className="text-xs text-on-surface-variant mt-1">Select an audit log to view diff</p>
      </div>
    );

    return (
      <InspectorPanel
        title="Event Details"
        subtitle={selectedLog.id}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm bg-surface-low p-4 rounded-xl border border-outline-variant/20">
            <div>
              <span className="text-xs text-on-surface-variant block mb-1 uppercase tracking-wider">Time</span>
              <span className="font-medium text-on-surface">{selectedLog.time}</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block mb-1 uppercase tracking-wider">User</span>
              <span className="font-medium text-on-surface truncate block" title={selectedLog.user}>{selectedLog.user}</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block mb-1 uppercase tracking-wider">Action</span>
              <span className="font-mono text-primary-600 font-bold">{selectedLog.action}</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block mb-1 uppercase tracking-wider">Resource</span>
              <span className="font-mono text-on-surface">{selectedLog.resource}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-2">Before</h4>
            <pre className="bg-surface-highest text-on-surface p-4 rounded-xl overflow-x-auto text-xs font-mono border border-outline-variant/10 shadow-inner">
              {JSON.stringify(selectedLog.diff.before, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-2">After</h4>
            <pre className="bg-surface-highest text-on-surface p-4 rounded-xl overflow-x-auto text-xs font-mono border border-outline-variant/10 shadow-inner">
              {JSON.stringify(selectedLog.diff.after, null, 2)}
            </pre>
          </div>
          
          <div className="pt-2">
            <span className="text-xs text-on-surface-variant block mb-1 uppercase tracking-wider">Origin IP</span>
            <span className="font-mono text-sm text-on-surface">{selectedLog.ip}</span>
          </div>
        </div>
      </InspectorPanel>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col pb-6">
      <div className="shrink-0">
        <PageHeader title="Audit Log" description="System-wide activity monitoring and security logging" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <StatCard label="Total Events" value="12,450" icon={Activity} color="primary" />
        <StatCard label="Admin Changes" value="45" icon={UserCog} color="secondary" />
        <StatCard label="Security Anomalies" value="2" icon={ShieldAlert} color="error" />
        <StatCard label="Integrity Status" value="Healthy" icon={Database} color="success" />
      </div>

      <div className="flex-1 min-h-0">
        <SplitPane main={renderMain()} inspector={renderInspector()} mainCols={8} />
      </div>
    </div>
  );
}
