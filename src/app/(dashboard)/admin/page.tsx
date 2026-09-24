"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Users, UserPlus, IndianRupee, Stethoscope, ArrowRight, Settings, Activity, Bell, FileText, FileSignature } from "lucide-react";
import { useAdminOverview } from "@/features/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminOverview();

  const QUICK_LINKS = [
    { title: "Staff Management", desc: "Manage roles and users", href: "/admin/staff", icon: Users, color: "bg-primary-100 text-primary-700" },
    { title: "Patient Records", desc: "View EHR and profiles", href: "/patients", icon: UserPlus, color: "bg-secondary-100 text-secondary-700" },
    { title: "Billing", desc: "Invoices and payments", href: "/billing", icon: IndianRupee, color: "bg-medical-green/20 text-medical-green" },
    { title: "Reports", desc: "Analytics and KPIs", href: "/admin/reports", icon: Activity, color: "bg-tertiary-100 text-tertiary-700" },
    { title: "Notifications", desc: "Manage alerts", href: "/admin/notifications", icon: Bell, color: "bg-amber-100 text-amber-700" },
    { title: "Audit Log", desc: "System activity", href: "/admin/audit", icon: FileSignature, color: "bg-error/10 text-error" },
    { title: "Settings", desc: "Clinic configuration", href: "/admin/settings", icon: Settings, color: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="Admin Dashboard" 
        description="Overview of clinic operations and quick actions" 
        breadcrumbs={[
          { label: "Home", href: "/admin" },
          { label: "Administration" }
        ]}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl bg-surface-low" />
          <Skeleton className="h-[120px] rounded-xl bg-surface-low" />
          <Skeleton className="h-[120px] rounded-xl bg-surface-low" />
          <Skeleton className="h-[120px] rounded-xl bg-surface-low" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Staff"
            value={data?.stats.totalStaff.toString() || "0"}
            icon={Users}
            color="primary"
          />
          <StatCard
            label="Total Patients"
            value={data?.stats.totalPatients.toString() || "0"}
            icon={UserPlus}
            color="secondary"
          />
          <StatCard
            label="Revenue (Month)"
            value={`₹${data?.stats.revenueMonth.toLocaleString()}`}
            icon={IndianRupee}
            color="success"
          />
          <StatCard
            label="Active Doctors"
            value={data?.stats.activeDoctors.toString() || "0"}
            icon={Stethoscope}
            color="tertiary"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-on-surface px-1">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.title} 
                  href={link.href}
                  className="bg-surface-lowest rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary-300 border border-outline-variant/20 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface text-sm mb-1">{link.title}</h3>
                    <p className="text-xs text-on-surface-variant">{link.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-on-surface px-1">Recent Activity</h2>
          {isLoading ? (
            <Skeleton className="h-[400px] rounded-xl bg-surface-low" />
          ) : (
            <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 p-5 shadow-sm">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                {data?.recentActivity?.slice(0, 10).map((activity: any, i: number) => (
                  <div key={activity.id || i} className="relative flex items-start gap-4">
                    <div className="absolute left-2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-surface-lowest z-10" />
                    <div className="pl-6 flex-1">
                      <p className="text-sm font-medium text-on-surface">{activity.action}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
                {(!data?.recentActivity || data.recentActivity.length === 0) && (
                  <div className="text-center py-8 text-sm text-on-surface-variant">
                    No recent activity.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
