"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="Settings" description="Manage clinic preferences and system configuration" />
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-64 border-r bg-slate-50 p-4">
            <TabsList className="flex md:flex-col h-auto bg-transparent space-y-1 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile" className="justify-start w-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Profile</TabsTrigger>
              <TabsTrigger value="clinic" className="justify-start w-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Clinic Details</TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start w-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Notifications</TabsTrigger>
              <TabsTrigger value="billing" className="justify-start w-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Billing</TabsTrigger>
              <TabsTrigger value="users" className="justify-start w-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Users</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-6">
            <TabsContent value="profile" className="m-0 space-y-6 max-w-2xl">
              <h3 className="text-lg font-medium">Personal Profile</h3>
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center text-slate-500 font-medium text-2xl">
                  AD
                </div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="admin@clinic.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 9876543210" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinic" className="m-0 space-y-6 max-w-2xl">
              <h3 className="text-lg font-medium">Clinic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Clinic Name</Label>
                  <Input defaultValue="Peaceful Fermi Clinic" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Health Street, Medical District, MD 12345" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Contact</Label>
                    <Input defaultValue="080-1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input defaultValue="29ABCDE1234F1Z5" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 space-y-6 max-w-2xl">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">Receive daily summaries and critical alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-slate-500">Urgent appointment cancellations or changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Integration</Label>
                    <p className="text-sm text-slate-500">Send reminders to patients via WhatsApp</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="m-0 space-y-6 max-w-2xl">
              <h3 className="text-lg font-medium">Billing Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select defaultValue="inr">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">INR (₹)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Tax Rate (%)</Label>
                    <Input type="number" defaultValue="18" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate Invoices</Label>
                    <p className="text-sm text-slate-500">Automatically create invoice after consultation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="m-0 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Management</h3>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/staff'}>
                  Go to Staff Directory
                </Button>
              </div>
              <p className="text-sm text-slate-500">Manage detailed roles and permissions in the Staff section.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
