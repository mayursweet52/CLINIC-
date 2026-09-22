"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Users, UserPlus, IndianRupee, Stethoscope, CreditCard, BarChart3, Settings, FileText } from "lucide-react";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState({ staff: 0, patients: 0, appointments: 0, doctors: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/staff").then(r => r.json()),
      fetch("/api/patients").then(r => r.json()),
      fetch("/api/appointments").then(r => r.json()),
      fetch("/api/audit?limit=10").then(r => r.json())
    ]).then(([staffRes, patientRes, apptRes, auditRes]) => {
      setStats({
        staff: Array.isArray(staffRes) ? staffRes.length : 0,
        patients: Array.isArray(patientRes) ? patientRes.length : 0,
        appointments: Array.isArray(apptRes) ? apptRes.length : 0,
        doctors: Array.isArray(staffRes) ? staffRes.filter((s: any) => s.role === "DOCTOR").length : 0
      });
      setActivities(Array.isArray(auditRes) ? auditRes.slice(0, 10) : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { title: "Staff Management", icon: Users, count: stats.staff, action: "Manage", href: "/admin/staff" },
    { title: "Patient Records", icon: UserPlus, count: stats.patients, action: "Browse", href: "/admin/patients" },
    { title: "Billing", icon: CreditCard, count: 120, action: "View", href: "/admin/billing" },
    { title: "Reports", icon: BarChart3, count: 5, action: "Open", href: "/admin/reports" },
    { title: "Settings", icon: Settings, count: null, action: "Configure", href: "/admin/settings" },
    { title: "Audit Log", icon: FileText, count: null, action: "View", href: "/admin/audit" },
  ];

  const getActionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("ADD")) return "bg-emerald-500";
    if (action.includes("DELETE") || action.includes("REMOVE")) return "bg-red-500";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "bg-blue-500";
    return "bg-slate-400";
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader 
        title="Admin Dashboard" 
        description="Monitor clinic metrics and operations"
      />
      
      {/* 4 StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Staff" value={stats.staff} icon={Users} />
        <StatCard title="Total Patients" value={stats.patients} icon={UserPlus} />
        <StatCard title="Revenue (Month)" value="₹1.2M" icon={IndianRupee} />
        <StatCard title="Active Doctors" value={stats.doctors} icon={Stethoscope} />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => (
            <div 
              key={idx}
              onClick={() => router.push(link.href)}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between h-32 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-900">{link.title}</span>
                </div>
              </div>
              <div className="flex items-end justify-between mt-4">
                {link.count !== null ? (
                  <span className="text-2xl font-semibold text-slate-800">{link.count}</span>
                ) : (
                  <span className="text-2xl font-semibold text-transparent">-</span>
                )}
                <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
                  {link.action} <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-200 mt-2"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="relative border-l border-slate-200 ml-3 space-y-6">
              {activities.map((activity, idx) => (
                <div key={activity.id || idx} className="relative pl-6">
                  <span 
                    className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${getActionColor(activity.action)}`} 
                  />
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{activity.userEmail || "System"}</span>{" "}
                    <span className="text-slate-600">{activity.action.toLowerCase().replace(/_/g, " ")}</span>{" "}
                    <span className="font-medium">{activity.resource}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt || Date.now()), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No activity yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
