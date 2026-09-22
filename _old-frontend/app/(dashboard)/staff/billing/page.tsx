'use client';

import { useState, useEffect } from "react";
import { DollarSign, Clock, CheckCircle, AlertCircle, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BillingDashboard() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      const res = await fetch("/api/billing");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setBills(data);
      }
    } catch (error) {
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleMarkAsPaid = async (billId: string) => {
    setActionLoadingId(billId);
    try {
      const res = await fetch("/api/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, paymentStatus: "PAID" })
      });
      if (res.ok) {
        toast.success("Payment collected successfully!");
        setBills(prev => prev.map(b => b.id === billId ? { ...b, paymentStatus: "PAID" } : b));
      } else {
        toast.error("Failed to mark as paid");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute Stats
  const today = new Date().toLocaleDateString();
  const totalBilled = bills.reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);
  const paidToday = bills.filter(b => b.paymentStatus === 'PAID' && new Date(b.createdAt).toLocaleDateString() === today)
                         .reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);
  const pendingCount = bills.filter(b => b.paymentStatus === 'UNPAID').length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const overdueCount = bills.filter(b => b.paymentStatus === 'UNPAID' && new Date(b.createdAt) < thirtyDaysAgo).length;

  const filteredBills = bills.filter(b => {
    if (filter === "ALL") return true;
    if (filter === "PAID") return b.paymentStatus === "PAID";
    if (filter === "PENDING") return b.paymentStatus === "UNPAID";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Billing & Invoices" 
        description="Track and manage patient billing"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Billed" value={`₹${totalBilled}`} icon={DollarSign} />
        <StatCard title="Pending Invoices" value={pendingCount} icon={Clock} />
        <StatCard title="Paid Today" value={`₹${paidToday}`} icon={CheckCircle} />
        <StatCard title="Overdue" value={overdueCount} icon={AlertCircle} className={overdueCount > 0 ? 'text-red-600' : ''} />
      </div>

      <Card className="flex flex-col">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
             <Button variant={filter === "ALL" ? "default" : "outline"} onClick={() => setFilter("ALL")}>All</Button>
             <Button variant={filter === "PENDING" ? "default" : "outline"} onClick={() => setFilter("PENDING")}>Pending</Button>
             <Button variant={filter === "PAID" ? "default" : "outline"} onClick={() => setFilter("PAID")}>Paid</Button>
          </div>
        </div>

        {loading ? (
           <div className="p-4"><TableSkeleton rows={5} /></div>
        ) : filteredBills.length === 0 ? (
           <div className="p-8"><EmptyState title="No invoices found" description="Try changing your filters" icon={FileText} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Doctor</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{bill.invoiceNo || 'N/A'}</td>
                    <td className="px-4 py-3">{bill.appointment?.patient?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{bill.appointment?.doctor?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{bill.totalAmount}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={bill.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <PermissionGate permission="bill:update">
                        {bill.paymentStatus !== 'PAID' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleMarkAsPaid(bill.id)}
                            disabled={actionLoadingId === bill.id}
                          >
                            {actionLoadingId === bill.id ? 'Processing...' : 'Collect Payment'}
                          </Button>
                        )}
                      </PermissionGate>
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                        Download PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
