"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Building2, Users, List as ListIcon, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Department = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  _count: {
    doctors: number;
    conditions: number;
  };
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; dept: Department | null }>({ open: false, dept: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  
  const [formData, setFormData] = useState({ name: "", slug: "", icon: "", description: "", order: 0 });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setFormData({ name: "", slug: "", icon: "🏥", description: "", order: departments.length });
    setFormError("");
    setAddDialog(true);
  };

  const openEdit = (dept: Department) => {
    setFormData({ 
      name: dept.name, 
      slug: dept.slug, 
      icon: dept.icon || "🏥", 
      description: dept.description || "", 
      order: dept.order 
    });
    setFormError("");
    setEditDialog({ open: true, dept });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSave = async (isEdit = false) => {
    if (!formData.name || !formData.slug) {
      setFormError("Name and slug are required");
      return;
    }
    
    setSaving(true);
    setFormError("");
    
    try {
      const url = isEdit ? `/api/admin/departments/${editDialog.dept?.id}` : "/api/admin/departments";
      const method = isEdit ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");
      
      await fetchDepartments();
      setAddDialog(false);
      setEditDialog({ open: false, dept: null });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await fetch(`/api/admin/departments/${deleteDialog.id}`, { method: "DELETE" });
      await fetchDepartments();
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Administration" }, { label: "Departments" }]}
        title="Departments"
        description="Manage clinic departments and conditions"
        action={
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-surface-low animate-pulse" />
          ))}
        </div>
      ) : departments.filter(d => d.isActive).length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create your first department to organize doctors and conditions."
          action={<Button onClick={openAdd}>Add First Department</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.filter(d => d.isActive).map((dept) => (
            <div key={dept.id} className="bg-surface-lowest rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-all flex flex-col relative group">
              <div className="flex justify-between items-start mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-2xl">
                  {dept.icon || "🏥"}
                </div>
                <div className="absolute top-4 right-4" onClick={e => e.preventDefault()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(dept)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-error focus:text-error"
                        onClick={() => setDeleteDialog({ open: true, id: dept.id })}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <Link href={`/admin/departments/${dept.id}`} className="flex-1">
                <h3 className="text-lg font-semibold text-on-surface hover:text-primary transition-colors">
                  {dept.name}
                </h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mt-1 min-h-[40px]">
                  {dept.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant text-sm text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{dept._count.doctors} Doctors</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ListIcon className="w-4 h-4" />
                    <span>{dept._count.conditions} Conditions</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={addDialog || editDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setAddDialog(false);
            setEditDialog({ open: false, dept: null });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editDialog.open ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && <p className="text-sm text-error font-medium">{formError}</p>}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input value={formData.name} onChange={handleNameChange} placeholder="e.g. Cardiology" />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="❤️" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} placeholder="cardiology" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Brief description of this department..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialog(false); setEditDialog({ open: false, dept: null }); }}>Cancel</Button>
            <Button onClick={() => handleSave(editDialog.open)} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title="Delete Department"
        description="Are you sure? This will remove the department and hide its conditions."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
