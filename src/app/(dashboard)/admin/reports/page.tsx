"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Users, Activity, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { RangePicker } from "@/features/reports/components/RangePicker";
import { useAnalytics } from "@/features/reports/hooks";
const RevenueChart = dynamic(() => import("@/features/reports/components/Charts").then(m => m.RevenueChart), { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" /> });
const AppointmentsChart = dynamic(() => import("@/features/reports/components/Charts").then(m => m.AppointmentsChart), { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" /> });
import { DoctorPerformance } from "@/features/reports/components/DoctorPerformance";
import { TopDiagnoses } from "@/features/reports/components/TopDiagnoses";

function ReportsContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "30d";
  const { data, isLoading } = useAnalytics(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Reports & Analytics" description="Clinic performance metrics" />
        <div className="flex items-center space-x-4">
          <RangePicker />
          <Button variant="outline" onClick={() => window.location.href = `/api/analytics/export?range=${range}`}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={`₹${(data?.stats?.revenue || 0).toLocaleString()}`} icon={IndianRupee} />
        <StatCard label="Appointments" value={(data?.stats?.appointments || 0).toString()} icon={Activity} />
        <StatCard label="New Patients" value={(data?.stats?.newPatients || 0).toString()} icon={Users} />
        <StatCard label="No-show Rate" value={data?.stats?.noShowRate || "0%"} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={data?.revenueData || []} />
        <AppointmentsChart data={data?.appointmentsData || []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DoctorPerformance data={data?.doctorPerformance || []} isLoading={isLoading} />
        </div>
        <div className="col-span-1">
          <TopDiagnoses data={data?.topDiagnoses || []} />
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
