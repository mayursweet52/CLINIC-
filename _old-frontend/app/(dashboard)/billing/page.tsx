"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { IndianRupee, Clock, CheckCircle, RotateCcw, Search, MoreVertical, FileText, CreditCard, Download, Bell, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; billId: string | null }>({ isOpen: false, billId: null });

  useEffect(() => {
    // Mock fetch for bills, using appointments as proxy if /api/billing isn't returning bills array
    fetch("/api/appointments")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mockBills = data.map((a: any, i) => ({
            id: a.id,
            invoiceNo: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
            patientName: a.patientName || a.patient?.name,
            amount: 1500 + (Math.random() * 2000),
            date: a.date || Date.now(),
            status: a.rawStatus === "PAID" ? "PAID" : "PENDING"
          }));
          setBills(mockBills);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsPaid = async () => {
    if (!confirmDialog.billId) return;
    
    // Simulate API call
    setBills(prev => prev.map(b => b.id === confirmDialog.billId ? { ...b, status: "PAID" } : b));
    toast.success("Bill marked as paid");
    setConfirmDialog({ isOpen: false, billId: null });
  };

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Billing" 
        action={
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            Create Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Revenue" value="₹45,200" icon={IndianRupee} iconColor="text-emerald-500" />
        <StatCard title="Pending" value="₹12,500" icon={Clock} iconColor="text-amber-500" />
        <StatCard title="Paid Today" value="32" icon={CheckCircle} iconColor="text-blue-500" />
        <StatCard title="Refunds" value="₹0" icon={RotateCcw} iconColor="text-slate-500" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
            </select>
            {/* Simple date range mock */}
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice #</th>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={5} cols={6} />
                  </td>
                </tr>
              ) : filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr 
                    key={bill.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4" onClick={() => router.push(`/billing/${bill.id}`)}>
                      <span className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                        {bill.invoiceNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium" onClick={() => router.push(`/billing/${bill.id}`)}>
                      {bill.patientName}
                    </td>
                    <td className="px-6 py-4 font-mono tabular-nums text-right font-medium text-slate-900">
                      ₹{bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {format(new Date(bill.date), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/billing/${bill.id}`)}>
                            <FileText className="mr-2 h-4 w-4" /> View Invoice
                          </DropdownMenuItem>
                          {bill.status !== "PAID" && (
                            <DropdownMenuItem onClick={() => setConfirmDialog({ isOpen: true, billId: bill.id })}>
                              <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          {bill.status !== "PAID" && (
                            <DropdownMenuItem>
                              <Bell className="mr-2 h-4 w-4" /> Send Reminder
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState 
                      icon={AlertCircle} 
                      title="No bills found" 
                      description={searchQuery ? "Try adjusting your filters" : "Create a new invoice to get started"}
                      action={
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white mt-2">
                          Create Invoice
                        </Button>
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, billId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this invoice as paid? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, billId: null })}>Cancel</Button>
            <Button className="bg-primary-600 hover:bg-primary-700 text-white" onClick={handleMarkAsPaid}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
