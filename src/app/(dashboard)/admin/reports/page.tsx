"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Users, Activity, AlertTriangle } from "lucide-react";
import { RangePicker } from "@/features/reports/components/RangePicker";
import { useAnalytics } from "@/features/reports/hooks";
import { RevenueChart, AppointmentsChart } from "@/features/reports/components/Charts";
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue" value={`₹${(data?.stats?.revenue || 0).toLocaleString()}`} icon={<IndianRupee className="h-4 w-4 text-emerald-500" />} />
        <StatCard title="Appointments" value={(data?.stats?.appointments || 0).toString()} icon={<Activity className="h-4 w-4 text-blue-500" />} />
        <StatCard title="New Patients" value={(data?.stats?.newPatients || 0).toString()} icon={<Users className="h-4 w-4 text-purple-500" />} />
        <StatCard title="No-show Rate" value={data?.stats?.noShowRate || "0%"} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
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
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
