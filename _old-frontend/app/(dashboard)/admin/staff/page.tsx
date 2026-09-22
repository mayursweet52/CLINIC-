"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/shared/PermissionGate";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      if (res.ok) {
        setStaff(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Management" 
        description="Manage clinic employees, roles, and access"
        action={
          <PermissionGate permission="user:manage">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </PermissionGate>
        }
      />
      
      <div className="rounded-md border bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold">All Staff</h2>
        </div>
        
        {loading ? (
          <div className="p-4"><TableSkeleton rows={5} /></div>
        ) : staff.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No staff found" description="Add your first staff member to get started" icon={Users} />
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {staff.map((member) => (
                  <tr key={member.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{member.name}</td>
                    <td className="p-4 align-middle">
                      <StatusBadge status={member.role} />
                    </td>
                    <td className="p-4 align-middle">{member.department}</td>
                    <td className="p-4 align-middle text-muted-foreground">{member.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
