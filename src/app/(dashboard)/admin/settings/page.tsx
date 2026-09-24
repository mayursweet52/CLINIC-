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
import { User, Building, Bell, CreditCard, Users, Save, Camera } from "lucide-react";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader title="Settings" description="Manage clinic preferences and system configuration" />
        <Button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex-1 flex flex-col md:flex-row min-h-[500px]">
        <Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full w-full">
          
          <div className="w-full md:w-64 bg-surface-low border-b md:border-b-0 md:border-r border-outline-variant/20 p-4 shrink-0">
            <TabsList className="flex md:flex-col h-auto bg-transparent space-y-1.5 w-full justify-start overflow-x-auto p-0">
              <TabsTrigger 
                value="profile" 
                className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors"
              >
                <User className="w-4 h-4 mr-3 opacity-70" /> Profile
              </TabsTrigger>
              <TabsTrigger 
                value="clinic" 
                className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors"
              >
                <Building className="w-4 h-4 mr-3 opacity-70" /> Clinic Details
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors"
              >
                <Bell className="w-4 h-4 mr-3 opacity-70" /> Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-3 opacity-70" /> Billing
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="justify-start w-full py-2.5 px-4 rounded-xl text-on-surface-variant data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-700 data-[state=active]:font-medium transition-colors"
              >
                <Users className="w-4 h-4 mr-3 opacity-70" /> Users
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-6 lg:p-10 overflow-auto">
            
            <TabsContent value="profile" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-semibold text-on-surface mb-1">Personal Profile</h3>
                <p className="text-sm text-on-surface-variant">Update your personal information and avatar.</p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="relative group cursor-pointer">
                  <div className="h-24 w-24 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-3xl shadow-sm border border-primary-200">
                    AD
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="bg-surface-lowest border-outline-variant/30 text-on-surface font-medium">
                    Upload new avatar
                  </Button>
                  <p className="text-xs text-on-surface-variant mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label className="text-on-surface">Full Name</Label>
                  <Input defaultValue="Admin User" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                </div>
                <div className="space-y-2">
                  <Label className="text-on-surface">Role</Label>
                  <Input defaultValue="Superadmin" disabled className="bg-surface-highest border-transparent text-on-surface-variant cursor-not-allowed opacity-80" />
                </div>
                <div className="space-y-2">
                  <Label className="text-on-surface">Email Address</Label>
                  <Input defaultValue="admin@clinic.com" type="email" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                </div>
                <div className="space-y-2">
                  <Label className="text-on-surface">Phone Number</Label>
                  <Input defaultValue="+91 9876543210" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinic" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-semibold text-on-surface mb-1">Clinic Information</h3>
                <p className="text-sm text-on-surface-variant">Manage clinic identity and contact details.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-on-surface">Clinic Name</Label>
                  <Input defaultValue="Peaceful Fermi Clinic" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                </div>
                <div className="space-y-2">
                  <Label className="text-on-surface">Full Address</Label>
                  <Input defaultValue="123 Health Street, Medical District, MD 12345" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-on-surface">Contact Phone</Label>
                    <Input defaultValue="080-1234-5678" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-on-surface">GST / Registration No.</Label>
                    <Input defaultValue="29ABCDE1234F1Z5" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-semibold text-on-surface mb-1">Notification Preferences</h3>
                <p className="text-sm text-on-surface-variant">Configure how you and your patients receive updates.</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/20">
                  <div className="space-y-1">
                    <Label className="text-on-surface text-base">Email Notifications</Label>
                    <p className="text-sm text-on-surface-variant">Receive daily summaries and critical alerts directly to your inbox.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary-600" />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/20">
                  <div className="space-y-1">
                    <Label className="text-on-surface text-base">Patient SMS Alerts</Label>
                    <p className="text-sm text-on-surface-variant">Automatically send appointment confirmations and reminders via SMS.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary-600" />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/20">
                  <div className="space-y-1">
                    <Label className="text-on-surface text-base">WhatsApp Integration</Label>
                    <p className="text-sm text-on-surface-variant">Send lab reports and prescriptions to patients via WhatsApp.</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary-600" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-semibold text-on-surface mb-1">Billing Settings</h3>
                <p className="text-sm text-on-surface-variant">Configure default currency, taxes, and invoice behavior.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-on-surface">Default Currency</Label>
                    <Select defaultValue="inr">
                      <SelectTrigger className="bg-surface-low border-outline-variant/30 text-on-surface focus:ring-primary-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">INR (₹)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-on-surface">Default Tax Rate (%)</Label>
                    <Input type="number" defaultValue="18" className="bg-surface-low border-outline-variant/30 focus-visible:ring-primary-500 text-on-surface" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/20">
                  <div className="space-y-1">
                    <Label className="text-on-surface text-base">Auto-generate Invoices</Label>
                    <p className="text-sm text-on-surface-variant">Automatically create a draft invoice when an appointment is marked as completed.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary-600" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="m-0 space-y-8 max-w-2xl animate-in fade-in duration-300">
              <div className="p-8 bg-surface-low rounded-2xl border border-outline-variant/20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-on-surface mb-2">User Management moved</h3>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6">Detailed roles, permissions, and staff onboarding are now managed in the dedicated Staff Directory.</p>
                <Button className="bg-primary-600 hover:bg-primary-700 text-white" onClick={() => window.location.href = '/admin/staff'}>
                  Go to Staff Directory
                </Button>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
