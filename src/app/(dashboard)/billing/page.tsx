"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { IndianRupee, Clock, CheckCircle, RotateCcw, Plus, Search, Calendar, FileText, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBills } from "@/features/billing/hooks";
import { SplitPane } from "@/components/shared/SplitPane";
import { InspectorPanel } from "@/components/shared/InspectorPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export default function BillingPage() {
  const { data: bills, isLoading } = useBills();
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const handleRowClick = (bill: any) => {
    setSelectedBill(bill);
  };

  const renderMain = () => (
    <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/20 flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-lowest">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input placeholder="Search invoice..." className="pl-9 bg-surface-low border-outline-variant/30 text-on-surface focus-visible:ring-primary-500" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] bg-surface-low border-outline-variant/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="border-outline-variant/30 text-on-surface-variant hover:text-on-surface">
          <Calendar className="mr-2 h-4 w-4" /> Date Range
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {bills?.map((bill: any) => (
                <tr 
                  key={bill.id}
                  onClick={() => handleRowClick(bill)}
                  className={`hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer transition-colors ${selectedBill?.id === bill.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <td className="px-6 py-4 font-mono text-xs font-medium text-on-surface">{bill.id}</td>
                  <td className="px-6 py-4 font-medium text-on-surface">{bill.patientName}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{bill.date}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-on-surface">₹{bill.amount.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={bill.status} /></td>
                </tr>
              ))}
              {(!bills || bills.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="p-4 border-t border-outline-variant/20 bg-surface-low text-xs text-on-surface-variant flex justify-between items-center">
        <span>Showing {bills?.length || 0} invoices</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" disabled>Prev</Button>
          <Button variant="ghost" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );

  const renderInspector = () => {
    if (!selectedBill) return (
      <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center h-64">
        <div className="w-12 h-12 bg-surface-low rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-on-surface">No Invoice Selected</h3>
        <p className="text-xs text-on-surface-variant mt-1">Select an invoice to view details</p>
      </div>
    );
    
    return (
      <InspectorPanel
        title="Invoice Details"
        subtitle={selectedBill.id}
        status={selectedBill.status}
      >
        <div className="space-y-6">

          <div className="bg-surface-low rounded-xl p-4 border border-outline-variant/20 space-y-3">
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Patient Name</p>
              <p className="font-medium text-on-surface">{selectedBill.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Invoice Date</p>
              <p className="text-sm text-on-surface">{selectedBill.date}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" /> Line Items
            </h4>
            <div className="space-y-2">
              {selectedBill.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-mono text-sm text-on-surface">₹{item.price * item.quantity}</p>
                </div>
              ))}
              {!selectedBill.items && (
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm font-medium text-on-surface">Consultation Fee</p>
                  <p className="font-mono text-sm text-on-surface">₹{selectedBill.amount}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center">
            <span className="font-semibold text-on-surface">Total Amount</span>
            <span className="font-mono text-xl font-bold text-primary-600">₹{selectedBill.amount.toLocaleString()}</span>
          </div>

          <div className="pt-4 space-y-3">
            <Button className="w-full bg-medical-green hover:bg-emerald-600 text-white font-medium shadow-sm">
              <Check className="w-4 h-4 mr-2" /> Mark as Paid
            </Button>
            <Button variant="outline" className="w-full border-outline-variant/30 text-on-surface hover:bg-surface-low">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>
      </InspectorPanel>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader title="Billing" description="Manage invoices and payments" />
        <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <StatCard label="Today's Revenue" value="₹12,450" icon={IndianRupee} color="success" />
        <StatCard label="Pending" value="₹45,000" icon={Clock} color="tertiary" />
        <StatCard label="Paid Today" value="18" icon={CheckCircle} color="primary" />
        <StatCard label="Refunds" value="2" icon={RotateCcw} color="error" />
      </div>

      <div className="flex-1 min-h-0">
        <SplitPane
          main={renderMain()}
          inspector={renderInspector()}
          mainCols={8}
        />
      </div>
    </div>
  );
}
