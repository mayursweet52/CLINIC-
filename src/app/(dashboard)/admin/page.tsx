"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Users, UserPlus, IndianRupee, Stethoscope } from "lucide-react";
import { useAdminOverview } from "@/features/admin/hooks";
import { QuickLinksGrid } from "@/features/admin/components/QuickLinksGrid";
import { RecentActivity } from "@/features/admin/components/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminOverview();

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Overview of clinic operations and quick actions" />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Staff"
            value={data?.stats.totalStaff.toString() || "0"}
            icon={Users}
          />
          <StatCard
            label="Total Patients"
            value={data?.stats.totalPatients.toString() || "0"}
            icon={UserPlus}
          />
          <StatCard
            label="Revenue (Month)"
            value={`₹${data?.stats.revenueMonth.toLocaleString()}`}
            icon={IndianRupee}
          />
          <StatCard
            label="Active Doctors"
            value={data?.stats.activeDoctors.toString() || "0"}
            icon={Stethoscope}
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold tracking-tight">Quick Links</h2>
          <QuickLinksGrid />
        </div>
        <div className="col-span-1">
          {isLoading ? (
            <Skeleton className="h-[400px] rounded-xl" />
          ) : (
            <RecentActivity activities={data?.recentActivity || []} />
          )}
        </div>
      </div>
    </div>
  );
}
