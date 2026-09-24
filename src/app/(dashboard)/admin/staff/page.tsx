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

export default function StaffPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  const mockData = [
    { id: '1', name: 'Vikram Singh', role: 'Superadmin', email: 'vikram.singh@aarogyaclinic.in', phone: '+91 9876543210', status: 'Active', dept: 'Management' },
    { id: '2', name: 'Dr. Ananya Sharma', role: 'Doctor', email: 'ananya.sharma@aarogyaclinic.in', phone: '+91 9876543211', status: 'Active', dept: 'Cardiology' },
    { id: '3', name: 'Kavita Nair', role: 'Receptionist', email: 'kavita.nair@aarogyaclinic.in', phone: '+91 9876543212', status: 'Inactive', dept: 'Front Desk' },
    { id: '4', name: 'Suresh Patel', role: 'Pharmacist', email: 'suresh.patel@aarogyaclinic.in', phone: '+91 9876543213', status: 'Active', dept: 'Pharmacy' },
  ];

  const filteredData = mockData.filter(item => 
    !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderMain = () => (
    <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/20 flex gap-4 items-center bg-surface-lowest">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input 
            placeholder="Search staff by name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-surface-low border-outline-variant/30 text-on-surface focus-visible:ring-primary-500" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-medium">Staff Member</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredData.map((staff) => (
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
                <td className="px-6 py-4 text-on-surface-variant">{staff.dept}</td>
                <td className="px-6 py-4"><StatusBadge status={staff.status} /></td>
              </tr>
            ))}
            {filteredData.length === 0 && (
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
        status={selectedStaff.status}
      >
        <div className="space-y-6">
          <div className="bg-surface-low rounded-xl p-4 border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-3 text-sm text-on-surface">
              <Mail className="w-4 h-4 text-on-surface-variant" />
              <span>{selectedStaff.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface">
              <Phone className="w-4 h-4 text-on-surface-variant" />
              <span>{selectedStaff.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface">
              <Building className="w-4 h-4 text-on-surface-variant" />
              <span>{selectedStaff.dept} Department</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-surface-high text-xs text-on-surface font-medium border border-outline-variant/20">System Login</span>
              {selectedStaff.role === 'Superadmin' && <span className="px-2.5 py-1 rounded-md bg-primary-100 text-primary-700 text-xs font-medium">Full Access</span>}
              {selectedStaff.role === 'Doctor' && <span className="px-2.5 py-1 rounded-md bg-secondary-100 text-secondary-700 text-xs font-medium">Write Rx</span>}
              {selectedStaff.role === 'Pharmacist' && <span className="px-2.5 py-1 rounded-md bg-medical-green/20 text-medical-green text-xs font-medium">Inventory</span>}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 space-y-3">
            <Button className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <StatCard label="Total Staff" value="48" icon={Users} color="primary" />
        <StatCard label="Active" value="42" icon={UserCheck} color="success" />
        <StatCard label="On Leave" value="6" icon={UserMinus} color="tertiary" />
        <StatCard label="Doctors" value="15" icon={Stethoscope} color="secondary" />
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
              <Input placeholder="John Doe" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-on-surface">Email</Label>
              <Input type="email" placeholder="john@example.com" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-on-surface">Phone Number</Label>
              <Input placeholder="+91 9876543210" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-on-surface">Role</Label>
              <Select>
                <SelectTrigger className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-outline-variant/30">Cancel</Button>
            <Button onClick={() => { setIsAddOpen(false); toast.success("Staff added successfully"); }} className="bg-primary-600 text-white hover:bg-primary-700">Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
