"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShieldCheck, 
  Users, 
  Key, 
  History, 
  Download, 
  Save, 
  Plus, 
  FileText, 
  Stethoscope, 
  Package, 
  CreditCard, 
  Settings 
} from "lucide-react";
import { toast } from "sonner";

interface PermissionRow {
  id: string;
  name: string;
  description: string;
  category: "clinical" | "reception" | "pharmacy" | "billing" | "admin";
  admin: boolean;
  doctor: boolean;
  receptionist: boolean;
  pharmacist: boolean;
  staff: boolean;
}

const INITIAL_PERMISSIONS: PermissionRow[] = [
  // Clinical
  { id: "c1", category: "clinical", name: "View Patient Medical History", description: "Access complete EMR, vitals & past diagnoses", admin: true, doctor: true, receptionist: true, pharmacist: false, staff: false },
  { id: "c2", category: "clinical", name: "Create & Sign Digital Prescriptions", description: "Issue medicine orders with electronic signature", admin: true, doctor: true, receptionist: false, pharmacist: false, staff: false },
  { id: "c3", category: "clinical", name: "Order Lab & Diagnostic Tests", description: "Request CBC, Blood Sugar, Lipid Profile tests", admin: true, doctor: true, receptionist: false, pharmacist: false, staff: false },
  
  // Reception & Queue
  { id: "r1", category: "reception", name: "Book Appointments & Check-in", description: "Issue tokens and register walk-in patients", admin: true, doctor: false, receptionist: true, pharmacist: false, staff: true },
  { id: "r2", category: "reception", name: "Broadcast Token Call to TV", description: "Announce patient token on waiting room screen", admin: true, doctor: true, receptionist: true, pharmacist: false, staff: false },
  
  // Pharmacy
  { id: "p1", category: "pharmacy", name: "View Medicine Stock & Inventory", description: "Check batch numbers, quantities and expiry dates", admin: true, doctor: false, receptionist: false, pharmacist: true, staff: false },
  { id: "p2", category: "pharmacy", name: "Dispense Prescriptions", description: "Deduct medicine stock and mark Rx dispensed", admin: true, doctor: false, receptionist: false, pharmacist: true, staff: false },
  
  // Billing
  { id: "b1", category: "billing", name: "Generate Invoices & Collect Payments", description: "Cash, UPI and online Razorpay billing", admin: true, doctor: false, receptionist: true, pharmacist: true, staff: false },
  { id: "b2", category: "billing", name: "Apply Custom Discounts & Refunds", description: "High-privilege financial adjustments", admin: true, doctor: false, receptionist: false, pharmacist: false, staff: false },
  
  // Admin
  { id: "a1", category: "admin", name: "View Revenue & Financial Analytics", description: "Access /admin/reports and download Excel exports", admin: true, doctor: false, receptionist: false, pharmacist: false, staff: false },
  { id: "a2", category: "admin", name: "Manage Staff Roles & Clinic Settings", description: "Add/edit employees and change hospital profile", admin: true, doctor: false, receptionist: false, pharmacist: false, staff: false },
];

export default function RolePermissionMatrixPage() {
  const [permissions, setPermissions] = useState<PermissionRow[]>(INITIAL_PERMISSIONS);
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (id: string, role: "admin" | "doctor" | "receptionist" | "pharmacist" | "staff") => {
    setPermissions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [role]: !p[role] };
      }
      return p;
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Role & Permissions Matrix saved successfully!");
    }, 600);
  };

  const handleReset = () => {
    setPermissions(INITIAL_PERMISSIONS);
    toast.info("Permissions reset to system defaults.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Administration</span>
            <span>/</span>
            <span>Security & Access</span>
            <span>/</span>
            <span className="text-primary font-medium">Role & Permission Matrix</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Permissions & Access Control Matrix
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
              HIPAA L3 Compliant
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Audit and configure multi-tenant role privileges across clinical, reception, pharmacy, and billing desks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <History className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 text-xs shadow-md">
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Permissions Matrix"}
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">Active Roles</span>
            <p className="text-2xl font-black text-foreground mt-0.5">5 Roles</p>
            <p className="text-[11px] text-muted-foreground">Admin, Doctor, Recept, Pharm, Staff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">Total Scopes</span>
            <p className="text-2xl font-black text-foreground mt-0.5">{permissions.length} Scopes</p>
            <p className="text-[11px] text-muted-foreground">5 Core Functional Modules</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">High-Privilege</span>
            <p className="text-2xl font-black text-foreground mt-0.5">3 Scopes</p>
            <p className="text-[11px] text-amber-600 font-semibold">Elevated (Admin Restricted)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">Audit Status</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">Enforced</p>
            <p className="text-[11px] text-muted-foreground">Real-time RBAC Middleware</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Permissions Matrix Table Card */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border py-4">
          <CardTitle className="text-base font-bold">Access Control Matrix</CardTitle>
          <CardDescription className="text-xs">
            Toggle permissions per role. Changes take effect on next user action.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-bold text-muted-foreground uppercase text-[10px]">
                <th className="py-3 px-4 w-1/3">Permission Scope</th>
                <th className="py-3 px-3 text-center">Admin</th>
                <th className="py-3 px-3 text-center">Doctor</th>
                <th className="py-3 px-3 text-center">Receptionist</th>
                <th className="py-3 px-3 text-center">Pharmacist</th>
                <th className="py-3 px-3 text-center">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {permissions.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-foreground text-xs">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{row.description}</p>
                  </td>

                  {/* Admin Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input 
                      type="checkbox"
                      checked={row.admin}
                      onChange={() => togglePermission(row.id, "admin")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Doctor Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input 
                      type="checkbox"
                      checked={row.doctor}
                      onChange={() => togglePermission(row.id, "doctor")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Receptionist Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input 
                      type="checkbox"
                      checked={row.receptionist}
                      onChange={() => togglePermission(row.id, "receptionist")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Pharmacist Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input 
                      type="checkbox"
                      checked={row.pharmacist}
                      onChange={() => togglePermission(row.id, "pharmacist")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Staff Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input 
                      type="checkbox"
                      checked={row.staff}
                      onChange={() => togglePermission(row.id, "staff")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
