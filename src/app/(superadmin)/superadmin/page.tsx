import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2, Users, Calendar, IndianRupee, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const [
    totalClinics,
    activeClinics,
    totalUsers,
    totalAppointments,
    revenueResult,
    recentClinics
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: { not: "SUPERADMIN" } } }),
    prisma.healthAppointment.count(),
    prisma.billing.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true }
    }),
    prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, city: true, isActive: true, createdAt: true, slug: true }
    })
  ]);

  const totalRevenue = revenueResult._sum.totalAmount || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Manage all clinics and monitor platform health"
        action={
          <Button asChild>
            <Link href="/superadmin/clinics">View All Clinics</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Clinics" value={totalClinics.toString()} icon={Building2} color="primary" />
        <StatCard label="Active Users" value={totalUsers.toString()} icon={Users} color="secondary" />
        <StatCard label="Appointments" value={totalAppointments.toString()} icon={Calendar} color="success" />
        <StatCard
          label="Platform Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="tertiary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">Recent Clinics</h2>
            <Link href="/superadmin/clinics" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentClinics.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No clinics found"
              description="You haven't added any clinics yet."
              action={<Button asChild><Link href="/superadmin/clinics/new">Add New Clinic</Link></Button>}
            />
          ) : (
            <div className="bg-surface-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-low text-on-surface-variant font-medium border-b border-outline-variant">
                    <tr>
                      <th className="px-4 py-3">Clinic Name</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {recentClinics.map((clinic) => (
                      <tr key={clinic.id} className="hover:bg-surface-low/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/superadmin/clinics/${clinic.id}`} className="font-medium text-on-surface hover:text-primary">
                            {clinic.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{clinic.city || "-"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={clinic.isActive ? "ACTIVE" : "INACTIVE"} />
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {new Date(clinic.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-on-surface">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/superadmin/clinics/new" className="p-4 rounded-xl border border-outline-variant bg-surface-lowest hover:bg-surface-low transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-on-surface">Add New Clinic</h3>
                <p className="text-xs text-on-surface-variant">Onboard a new organization</p>
              </div>
            </Link>
            <Link href="/superadmin/clinics" className="p-4 rounded-xl border border-outline-variant bg-surface-lowest hover:bg-surface-low transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-on-surface">Manage Clinics</h3>
                <p className="text-xs text-on-surface-variant">View and edit all clinics</p>
              </div>
            </Link>
            <Link href="/superadmin" className="p-4 rounded-xl border border-outline-variant bg-surface-lowest hover:bg-surface-low transition-colors flex items-center gap-4 group opacity-75 cursor-not-allowed">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-on-surface">Platform Metrics</h3>
                <p className="text-xs text-on-surface-variant">Coming soon</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
