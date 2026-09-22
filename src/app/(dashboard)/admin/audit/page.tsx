"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const mockData = [
    { id: '1', time: '2026-09-22 10:30', user: 'admin@clinic.com', action: 'UPDATE', resource: 'Patient/123', ip: '192.168.1.1', diff: { before: { status: 'active' }, after: { status: 'inactive' } } },
    { id: '2', time: '2026-09-22 10:35', user: 'dr.smith@clinic.com', action: 'CREATE', resource: 'Prescription/456', ip: '192.168.1.5', diff: { before: null, after: { medicine: 'Paracetamol', dose: '500mg' } } },
    { id: '3', time: '2026-09-22 10:40', user: 'reception@clinic.com', action: 'DELETE', resource: 'Appointment/789', ip: '192.168.1.10', diff: { before: { time: '14:00', patient: 'John Doe' }, after: null } },
  ];

  const filteredData = mockData.filter(item => {
    if (actionFilter !== "all" && item.action !== actionFilter) return false;
    if (search && !item.user.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { accessorKey: "time", header: "Time" },
    { accessorKey: "user", header: "User", cell: ({ row }: any) => <span className="font-medium text-slate-900">{row.original.user}</span> },
    { 
      accessorKey: "action", 
      header: "Action",
      cell: ({ row }: any) => (
        <span className={`text-xs font-mono px-2 py-1 rounded ${
          row.original.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
          row.original.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {row.original.action}
        </span>
      )
    },
    { accessorKey: "resource", header: "Resource", cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.resource}</span> },
    { accessorKey: "ip", header: "IP Address", cell: ({ row }: any) => <span className="text-slate-500 text-xs">{row.original.ip}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="System-wide activity monitoring and security logging" />

      <div className="flex gap-4">
        <Input 
          placeholder="Search user..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs" 
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-slate-500 border rounded-md px-3 py-2">Date Range Filter</div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <DataTable 
          columns={columns} 
          data={filteredData} 
          onRowClick={(row) => setSelectedLog(row)} 
        />
      </div>

      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Audit Log Detail</SheetTitle>
          </SheetHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                <div>
                  <span className="text-slate-500 block mb-1">Time</span>
                  <span className="font-medium">{selectedLog.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">User</span>
                  <span className="font-medium">{selectedLog.user}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Action</span>
                  <span className="font-mono">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Resource</span>
                  <span className="font-mono">{selectedLog.resource}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">IP Address</span>
                  <span>{selectedLog.ip}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Before</h4>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedLog.diff.before, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">After</h4>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedLog.diff.after, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
