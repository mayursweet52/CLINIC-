"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

const CreateClinicSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6).max(10, "Valid pincode required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  ownerName: z.string().min(2, "Owner name is required"),
  ownerEmail: z.string().email("Valid email required"),
  ownerPhone: z.string().min(10, "Valid phone required"),
});

type FormData = z.infer<typeof CreateClinicSchema>;

export default function NewClinicPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: ""
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setErrors({});
    
    const parsed = CreateClinicSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      (parsed.error as any).errors.forEach((err: any) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setApiError(data.error || "Failed to create clinic");
        return;
      }
      
      setSuccessData(data.owner);
    } catch (error) {
      setApiError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!successData) return;
    navigator.clipboard.writeText(`Email: ${successData.email}\nPassword: ${successData.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Clinic"
        description="Create a new clinic. Admin credentials will be generated."
        breadcrumb={[{label: "Clinics", href: "/superadmin/clinics"}, {label: "New"}]}
      />

      <div className="max-w-2xl mx-auto bg-surface-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          
          <div className="p-6 space-y-6">
            {apiError && (
              <div className="p-4 rounded-lg bg-error/10 text-error flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-on-surface mb-4">Clinic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Name *</label>
                  <Input 
                    value={formData.name} 
                    onChange={handleNameChange}
                    className={`bg-surface-low ${errors.name ? 'border-error' : ''}`}
                    placeholder="e.g. City Hospital"
                  />
                  {errors.name && <p className="text-xs text-error">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Slug *</label>
                  <Input 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    className={`bg-surface-low ${errors.slug ? 'border-error' : ''}`}
                    placeholder="e.g. city-hospital"
                  />
                  {errors.slug && <p className="text-xs text-error">{errors.slug}</p>}
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Address *</label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className={`bg-surface-low ${errors.address ? 'border-error' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-error">{errors.address}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">City *</label>
                  <Input 
                    value={formData.city} 
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className={`bg-surface-low ${errors.city ? 'border-error' : ''}`}
                  />
                  {errors.city && <p className="text-xs text-error">{errors.city}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">State *</label>
                  <Input 
                    value={formData.state} 
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className={`bg-surface-low ${errors.state ? 'border-error' : ''}`}
                  />
                  {errors.state && <p className="text-xs text-error">{errors.state}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Pincode *</label>
                  <Input 
                    value={formData.pincode} 
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className={`bg-surface-low ${errors.pincode ? 'border-error' : ''}`}
                  />
                  {errors.pincode && <p className="text-xs text-error">{errors.pincode}</p>}
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface mb-4">Owner Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Owner Name *</label>
                  <Input 
                    value={formData.ownerName} 
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    className={`bg-surface-low ${errors.ownerName ? 'border-error' : ''}`}
                  />
                  {errors.ownerName && <p className="text-xs text-error">{errors.ownerName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Owner Email *</label>
                  <Input 
                    type="email"
                    value={formData.ownerEmail} 
                    onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className={`bg-surface-low ${errors.ownerEmail ? 'border-error' : ''}`}
                  />
                  {errors.ownerEmail && <p className="text-xs text-error">{errors.ownerEmail}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Owner Phone *</label>
                  <Input 
                    type="tel"
                    value={formData.ownerPhone} 
                    onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className={`bg-surface-low ${errors.ownerPhone ? 'border-error' : ''}`}
                  />
                  {errors.ownerPhone && <p className="text-xs text-error">{errors.ownerPhone}</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-surface-low border-t border-outline-variant">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Clinic"}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={!!successData} onOpenChange={(open) => !open && router.push("/superadmin/clinics")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <DialogTitle className="text-center text-xl">Clinic Created Successfully!</DialogTitle>
            <DialogDescription className="text-center text-on-surface-variant pt-2">
              The clinic and admin account have been set up.
              <br/>
              <strong className="text-error mt-2 block">Save these credentials now — they won't be shown again!</strong>
            </DialogDescription>
          </DialogHeader>
          
          {successData && (
            <div className="bg-surface-low rounded-lg p-4 font-mono text-sm space-y-2 my-4">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Email:</span>
                <span className="text-on-surface font-medium select-all">{successData.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Password:</span>
                <span className="text-on-surface font-medium select-all">{successData.password}</span>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => router.push("/superadmin/clinics")} className="w-full sm:w-auto">
              Go to Clinics List
            </Button>
            <Button onClick={copyCredentials} className="w-full sm:w-auto">
              {copied ? (
                <>Copied!</>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
