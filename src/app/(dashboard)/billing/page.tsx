"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { IndianRupee, Clock, CheckCircle, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBills } from "@/features/billing/hooks";
import { BillsTable } from "@/features/billing/components/BillsTable";

export default function BillingPage() {
  const { data: bills, isLoading } = useBills();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="Billing" description="Manage invoices and payments" />
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Revenue" value="₹12,450" icon={<IndianRupee className="h-4 w-4 text-emerald-500" />} />
        <StatCard title="Pending" value="₹45,000" icon={<Clock className="h-4 w-4 text-amber-500" />} />
        <StatCard title="Paid Today" value="18" icon={<CheckCircle className="h-4 w-4 text-blue-500" />} />
        <StatCard title="Refunds" value="2" icon={<RotateCcw className="h-4 w-4 text-red-500" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <Input placeholder="Search patient or invoice..." className="max-w-xs" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
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
        {/* Placeholder for date picker */}
        <div className="text-sm text-slate-500 border rounded-md px-3 py-2">
          Date Range Filter (Mock)
        </div>
      </div>

      <BillsTable data={bills || []} isLoading={isLoading} />
    </div>
  );
}
