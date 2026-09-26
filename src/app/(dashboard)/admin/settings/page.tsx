"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Building, Bell, CreditCard, Users, Save, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    pincode: "",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  useEffect(() => {
    if (settings?.settings) {
      setFormData({
        name: settings.settings.name || "",
        address: settings.settings.address || "",
        phone: settings.settings.phone || "",
        pincode: settings.settings.pincode || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
    onError: () => {
      toast.error("Failed to save settings");
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader title="Settings" description="Manage clinic preferences and system configuration" />
        <Button disabled={saveMutation.isPending} onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex-1 flex flex-col md:flex-row min-h-[500px]">
        <Tabs defaultValue="clinic" className="flex flex-col md:flex-row h-full w-full">
          
          <div className="w-full md:w-64 bg-surface-low border-b md:border-b-0 md:border-r border-outline-variant/20 p-4 shrink-0">
            <TabsList className="flex md:flex-col h-auto bg-transparent space-y-1.5 w-full justify-start overflow-x-auto p-0">
              <TabsTrigger value="clinic" className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors">
                <Building className="w-4 h-4 mr-3 opacity-70" /> Clinic Details
              </TabsTrigger>
              <TabsTrigger value="profile" className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors">
                <User className="w-4 h-4 mr-3 opacity-70" /> Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <TabsContent value="clinic" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-on-surface mb-1">Clinic Information</h3>
                  <p className="text-sm text-on-surface-variant">Update your clinic's public details</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-surface-high rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/50 transition-colors group">
                      <Camera className="w-6 h-6 text-on-surface-variant group-hover:text-primary-600 transition-colors mb-1" />
                      <span className="text-[10px] text-on-surface-variant font-medium">Upload</span>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-on-surface">Clinic Logo</Label>
                      <p className="text-xs text-on-surface-variant">Recommended size: 400x400px. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-on-surface">Clinic Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-on-surface">Address</Label>
                    <Input 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-on-surface">Phone Number</Label>
                      <Input 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-on-surface">Pincode</Label>
                      <Input 
                        value={formData.pincode} 
                        onChange={e => setFormData({...formData, pincode: e.target.value})} 
                        className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div className="space-y-6">
                 <div>
                  <h3 className="text-lg font-medium text-on-surface mb-1">Personal Profile</h3>
                  <p className="text-sm text-on-surface-variant">Update your personal account details</p>
                </div>
                <p className="text-sm text-on-surface-variant">Use the staff directory to edit profiles.</p>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
