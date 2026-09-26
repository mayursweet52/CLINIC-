"use client";

import { useState, useEffect, use } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, List as ListIcon, UserPlus, HeartPulse, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Condition = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  keywords: string[];
};

type DoctorUser = {
  id: string;
  name: string;
  email: string;
  
};

type DoctorDept = {
  doctor: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    profile: { specialization: string } | null;
  };
};

type DepartmentDetail = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  order: number;
  icon: string | null;
  isActive: boolean;
  conditions: Condition[];
  doctors: DoctorDept[];
};

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [dept, setDept] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [conditionDialog, setConditionDialog] = useState(false);
  const [cForm, setCForm] = useState({ name: "", slug: "", icon: "", keywords: "" });
  const [cSaving, setCSaving] = useState(false);

  const [assignDialog, setAssignDialog] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [assignSaving, setAssignSaving] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/admin/departments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDept(data.department);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setCForm(prev => ({ ...prev, name, slug }));
  };

  const saveCondition = async () => {
    if (!cForm.name || !cForm.slug) return;
    setCSaving(true);
    try {
      const keywordsArray = cForm.keywords.split(",").map(k => k.trim()).filter(Boolean);
      const res = await fetch("/api/admin/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: id,
          name: cForm.name,
          slug: cForm.slug,
          icon: cForm.icon || "🦠",
          keywords: keywordsArray
        })
      });
      if (res.ok) {
        setConditionDialog(false);
        fetchDetail();
      }
    } finally {
      setCSaving(false);
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const allStaff = await res.json();
        setAvailableDoctors(allStaff.filter((s: any) => s.role === "DOCTOR"));
        setSelectedDoctors(dept?.doctors.map((d: any) => d.doctor.id) || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAssignDialog = () => {
    fetchAvailableDoctors();
    setAssignDialog(true);
  };

  const handleAssignSave = async () => {
    setAssignSaving(true);
    try {
      const res = await fetch(`/api/admin/departments/${id}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorIds: selectedDoctors }),
      });
      if (res.ok) {
        setAssignDialog(false);
        fetchDetail();
      }
    } finally {
      setAssignSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Loading...</div>;
  if (!dept) return <div className="p-8 text-center text-error">Department not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[
          { label: "Administration" }, 
          { label: "Departments", href: "/admin/departments" },
          { label: dept.name }
        ]}
        title={dept.name}
        description={dept.description || "Manage conditions and doctors for this department"}
        action={
          <Button variant="outline" asChild>
            <a href="/admin/departments">Back to Departments</a>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">Conditions</h2>
            <Button size="sm" onClick={() => {
              setCForm({ name: "", slug: "", icon: "🦠", keywords: "" });
              setConditionDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>

          {dept.conditions.length === 0 ? (
            <EmptyState
              icon={HeartPulse}
              title="No conditions mapped"
              description="Add common ailments treated in this department."
            />
          ) : (
            <div className="bg-surface-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="divide-y divide-outline-variant">
                {dept.conditions.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-surface-low transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl shrink-0">
                        {c.icon || "🦠"}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{c.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.keywords.map(kw => (
                            <span key={kw} className="px-2 py-0.5 text-[10px] font-medium bg-surface-variant text-on-surface-variant rounded-full">
                              {kw}
                            </span>
                          ))}
                          {c.keywords.length === 0 && <span className="text-xs text-on-surface-variant">{c.slug}</span>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-on-surface-variant h-8 w-8">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-on-surface">Doctors ({dept.doctors.length})</h2>
              <Button size="sm" variant="secondary" className="gap-2" onClick={openAssignDialog}>
                <UserPlus className="w-4 h-4" />
                Assign
              </Button>
            </div>
            
            {dept.doctors.length === 0 ? (
              <div className="p-6 bg-surface-lowest border border-outline-variant rounded-xl text-center">
                <p className="text-sm text-on-surface-variant">No doctors assigned yet.</p>
              </div>
            ) : (
              <div className="bg-surface-lowest rounded-xl border border-outline-variant divide-y divide-outline-variant">
                {dept.doctors.map(d => (
                  <div key={d.doctor.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {d.doctor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{d.doctor.name}</p>
                        <p className="text-xs text-on-surface-variant">{d.doctor.profile?.specialization || "General"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-error h-8 w-8">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-surface-lowest rounded-xl border border-outline-variant p-5">
            <h3 className="font-medium text-on-surface mb-3">Department Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Slug</span>
                <span className="font-mono text-on-surface">{dept.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Display Order</span>
                <span className="text-on-surface">{dept.order}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status</span>
                <span className={dept.isActive ? "text-success font-medium" : "text-error font-medium"}>
                  {dept.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Dialog open={conditionDialog} onOpenChange={setConditionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Condition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input value={cForm.name} onChange={handleCNameChange} placeholder="e.g. Hypertension" />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input value={cForm.icon} onChange={e => setCForm({ ...cForm, icon: e.target.value })} placeholder="❤️" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input value={cForm.slug} onChange={e => setCForm({ ...cForm, slug: e.target.value.toLowerCase() })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords (comma separated)</label>
              <Input 
                value={cForm.keywords} 
                onChange={e => setCForm({ ...cForm, keywords: e.target.value })} 
                placeholder="blood pressure, heart, bp"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConditionDialog(false)}>Cancel</Button>
            <Button onClick={saveCondition} disabled={cSaving}>
              {cSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Doctors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableDoctors.length === 0 ? <p>No doctors available.</p> : availableDoctors.map(d => (
              <label key={d.id} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={selectedDoctors.includes(d.id)} 
                  onChange={(e) => {
                    if (e.target.checked) setSelectedDoctors([...selectedDoctors, d.id]);
                    else setSelectedDoctors(selectedDoctors.filter(id => id !== d.id));
                  }} 
                />
                <span>{d.name} ({d.email})</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignSave} disabled={assignSaving}>{assignSaving ? 'Saving...' : 'Save Assignments'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


