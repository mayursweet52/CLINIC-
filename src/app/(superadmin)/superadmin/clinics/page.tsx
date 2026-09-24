"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Building2, Search, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

type Clinic = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  isActive: boolean;
  doctorCount: number;
  patientCount: number;
  createdAt: string;
};

export default function SuperAdminClinicsList() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; clinic: Clinic | null }>({ open: false, clinic: null });
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const res = await fetch("/api/superadmin/clinics");
      if (res.ok) {
        const data = await res.json();
        setClinics(data.clinics);
      }
    } catch (error) {
      console.error("Failed to fetch clinics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clinic: Clinic, newStatus: boolean) => {
    if (newStatus) setActivating(clinic.id);
    try {
      const res = await fetch(`/api/superadmin/clinics/${clinic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) {
        setClinics(clinics.map(c => c.id === clinic.id ? { ...c, isActive: newStatus } : c));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setActivating(null);
      setSuspendDialog({ open: false, clinic: null });
    }
  };

  const filtered = clinics.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.slug.toLowerCase().includes(search.toLowerCase()) || 
                          (c.city && c.city.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "ALL" ? true : filter === "ACTIVE" ? c.isActive : !c.isActive;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinics"
        description={`${clinics.length} clinics registered on platform`}
        action={
          <Button asChild>
            <Link href="/superadmin/clinics/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Clinic
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input 
            placeholder="Search by name, city, or slug..." 
            className="pl-9 bg-surface-lowest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          {["ALL", "ACTIVE", "INACTIVE"].map(f => (
            <Button 
              key={f}
              variant={filter === f ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter(f)}
              className="flex-1 sm:flex-none"
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clinics found"
          description={search ? "Try adjusting your filters" : "You haven't added any clinics yet."}
          action={search ? <Button onClick={() => { setSearch(""); setFilter("ALL"); }}>Clear Filters</Button> : <Button asChild><Link href="/superadmin/clinics/new">Add New Clinic</Link></Button>}
        />
      ) : (
        <div className="bg-surface-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-low text-on-surface-variant font-medium border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3 text-right">Doctors</th>
                  <th className="px-4 py-3 text-right">Patients</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-on-surface leading-tight">{clinic.name}</p>
                          <p className="text-xs text-on-surface-variant">{clinic.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{clinic.city || "-"}</td>
                    <td className="px-4 py-3 text-right text-on-surface-variant font-medium">{clinic.doctorCount}</td>
                    <td className="px-4 py-3 text-right text-on-surface-variant font-medium">{clinic.patientCount}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={clinic.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/clinics/${clinic.id}`}>View details</Link>
                          </DropdownMenuItem>
                          {clinic.isActive ? (
                            <DropdownMenuItem 
                              className="text-error focus:bg-error/10 focus:text-error cursor-pointer"
                              onClick={() => setSuspendDialog({ open: true, clinic })}
                            >
                              Suspend clinic
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-success focus:bg-success/10 focus:text-success cursor-pointer"
                              disabled={activating === clinic.id}
                              onClick={() => handleToggleStatus(clinic, true)}
                            >
                              Activate clinic
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={suspendDialog.open}
        onOpenChange={(open) => setSuspendDialog(prev => ({ ...prev, open }))}
        title="Suspend Clinic"
        description={`Are you sure you want to suspend ${suspendDialog.clinic?.name}? Users will lose access to the platform.`}
        confirmText="Suspend"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => { if(suspendDialog.clinic) handleToggleStatus(suspendDialog.clinic, false); }}
      />
    </div>
  );
}
