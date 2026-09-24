"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Users, Activity, AlertTriangle, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { useAnalytics } from "@/features/reports/hooks";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const RevenueChart = dynamic(() => import("@/features/reports/components/Charts").then(m => m.RevenueChart), { ssr: false, loading: () => <div className="h-[300px] bg-surface-low animate-pulse rounded-2xl border border-outline-variant/20" /> });
const AppointmentsChart = dynamic(() => import("@/features/reports/components/Charts").then(m => m.AppointmentsChart), { ssr: false, loading: () => <div className="h-[300px] bg-surface-low animate-pulse rounded-2xl border border-outline-variant/20" /> });

function RangePills({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const ranges = [
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: '1y', label: '1Y' }
  ];

  return (
    <div className="flex bg-surface-lowest rounded-xl p-1 shadow-sm border border-outline-variant/20">
      {ranges.map(r => {
        const isActive = r.id === current;
        return (
          <button
            key={r.id}
            onClick={() => router.push(`${pathname}?range=${r.id}`)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  );
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "30d";
  const { data, isLoading } = useAnalytics(range);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Reports & Analytics" description="Clinic performance metrics" />
        <div className="flex items-center space-x-4">
          <RangePills current={range} />
          <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm" onClick={() => window.location.href = `/api/analytics/export?range=${range}`}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={`₹${(data?.stats?.revenue || 0).toLocaleString()}`} icon={IndianRupee} color="success" />
        <StatCard label="Appointments" value={(data?.stats?.appointments || 0).toString()} icon={Activity} color="primary" />
        <StatCard label="New Patients" value={(data?.stats?.newPatients || 0).toString()} icon={Users} color="secondary" />
        <StatCard label="No-show Rate" value={data?.stats?.noShowRate || "0%"} icon={AlertTriangle} color="error" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Revenue Trend</h3>
          <RevenueChart data={data?.revenueData || []} />
        </div>
        <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Appointments Over Time</h3>
          <AppointmentsChart data={data?.appointmentsData || []} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant/20">
            <h3 className="text-lg font-semibold text-on-surface">Doctor Performance</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Doctor</th>
                    <th className="px-6 py-4 font-medium text-right">Appointments</th>
                    <th className="px-6 py-4 font-medium text-right">Rating</th>
                    <th className="px-6 py-4 font-medium text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {data?.doctorPerformance?.map((doc: any, i: number) => (
                    <tr key={i} className="hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-on-surface">{doc.name}</td>
                      <td className="px-6 py-4 text-right tabular-nums text-on-surface">{doc.appointments}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-medium text-on-surface">
                          {doc.rating} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 -mt-0.5" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-success-600">
                        ₹{doc.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!data?.doctorPerformance || data.doctorPerformance.length === 0) && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">No data available.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="col-span-1 bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Top Diagnoses</h3>
          <div className="space-y-6 flex-1">
            {data?.topDiagnoses?.slice(0, 5).map((item: any, index: number) => (
              <div key={item.id} className="space-y-2 group">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-tertiary-100 text-tertiary-700 flex items-center justify-center text-xs font-bold font-mono">
                      {index + 1}
                    </span>
                    <span className="font-medium text-on-surface group-hover:text-primary-600 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-on-surface-variant font-mono text-xs mt-0.5">{item.count}</span>
                </div>
                <div className="h-2 w-full bg-surface-low rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
            {(!data?.topDiagnoses || data.topDiagnoses.length === 0) && (
              <div className="text-center py-8 text-on-surface-variant text-sm">No diagnoses recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>}>
      <ReportsContent />
    </Suspense>
  );
}
