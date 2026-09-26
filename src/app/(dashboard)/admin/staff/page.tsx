"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SplitPane } from "@/components/shared/SplitPane";
import { InspectorPanel } from "@/components/shared/InspectorPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, UserCheck, Stethoscope, UserMinus, Search, Mail, Phone, Building, Edit, ShieldAlert, Key } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StaffPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    }
  });

  const addStaff = useMutation({
    mutationFn: async (newStaff: any) => {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff)
      });
      if (!res.ok) throw new Error("Failed to add staff");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff added successfully");
      setIsAddOpen(false);
    },
    onError: () => toast.error("Failed to add staff")
  });

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "DOCTOR" });

  const filteredData = staffList.filter((item: any) => 
    !search || item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderMain = () => (
    <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input 
            placeholder="Search staff..." 
            className="pl-9 bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 rounded-full h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-low/50 sticky top-0 z-10 shadow-sm border-b border-outline-variant/20">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Staff Member</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Department</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">Loading...</td></tr>
            ) : filteredData.map((staff: any) => (
              <tr 
                key={staff.id} 
                onClick={() => setSelectedStaff(staff)}
                className={`hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer transition-colors ${selectedStaff?.id === staff.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {staff.name.replace('Dr. ', '').substring(0, 1)}
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{staff.name}</p>
                    <p className="text-xs text-on-surface-variant">{staff.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-on-surface">{staff.role}</td>
                <td className="px-6 py-4 text-on-surface-variant">{staff.department || staff.dept || '-'}</td>
                <td className="px-6 py-4"><StatusBadge status={staff.isActive !== false ? 'Active' : 'Inactive'} /></td>
              </tr>
            ))}
            {!isLoading && filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInspector = () => {
    if (!selectedStaff) return (
      <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center h-64">
        <div className="w-12 h-12 bg-surface-low rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-on-surface">No Staff Selected</h3>
        <p className="text-xs text-on-surface-variant mt-1">Select a staff member to view details</p>
      </div>
    );

    return (
      <InspectorPanel
        title={selectedStaff.name}
        subtitle={selectedStaff.role}
        status={selectedStaff.isActive !== false ? 'Active' : 'Inactive'}
      >
        <div className="space-y-6">
          <div className="bg-surface-low rounded-xl p-4 border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-3 text-sm text-on-surface">
              <Mail className="w-4 h-4 text-on-surface-variant" />
              <span>{selectedStaff.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface">
              <Phone className="w-4 h-4 text-on-surface-variant" />
              <span>{selectedStaff.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface">
              <Building className="w-4 h-4 text-on-surface-variant" />
              <span>{selectedStaff.department || selectedStaff.dept || '-'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 space-y-3">
            <Button variant="outline" className="w-full border-outline-variant/30 text-on-surface hover:bg-surface-low" onClick={() => toast.success("Password reset link sent")}>
              <Key className="w-4 h-4 mr-2" /> Reset Password
            </Button>
            <Button variant="outline" className="w-full border-error/30 text-error hover:bg-error/10">
              <ShieldAlert className="w-4 h-4 mr-2" /> Deactivate Account
            </Button>
          </div>
        </div>
      </InspectorPanel>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col pb-6">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader title="Staff Management" description="Manage clinic staff, roles, and access" />
        <Button onClick={() => setIsAddOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <SplitPane main={renderMain()} inspector={renderInspector()} mainCols={8} />
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-lowest border border-outline-variant/20 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-on-surface">Add New Staff</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-on-surface">Full Name</Label>
              <Input 
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe" className="bg-surface-low border-outline-variant/30" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-on-surface">Email</Label>
              <Input 
                type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com" className="bg-surface-low border-outline-variant/30" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-on-surface">Phone Number</Label>
              <Input 
                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210" className="bg-surface-low border-outline-variant/30" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-on-surface">Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-outline-variant/30">Cancel</Button>
            <Button disabled={addStaff.isPending} onClick={() => addStaff.mutate(formData)} className="bg-primary-600 text-white hover:bg-primary-700">Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
