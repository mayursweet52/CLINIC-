"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  ShieldCheck, 
  Award, 
  Lock, 
  Bell, 
  History, 
  CheckCircle2, 
  Save, 
  Building2, 
  Phone, 
  Mail, 
  Stethoscope 
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Dr. Rajesh Sharma",
    email: user?.email || "doctor@aarogya.com",
    phone: "+91 98765 43210",
    department: "Cardiology",
    specialization: "Senior Interventional Cardiologist",
    licenseNo: "MCI-2014-9842",
    experience: "14 Years",
    bio: "Chief Consultant Cardiologist specializing in preventive cardiology and clinical hypertension management.",
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile & Clinical Credentials updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Administration</span>
            <span>/</span>
            <span>Staff Directory</span>
            <span>/</span>
            <span className="text-primary font-medium">Account & Clinical Profile</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Account & Clinical Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal credentials, medical license verification, role privileges, and security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => toast.info("Changes discarded")}>
            Discard
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Profile Changes"}
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Profile Overview & Readiness */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="text-center p-6 bg-card border-border shadow-sm">
            <div className="relative inline-block mx-auto mb-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-md">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user?.name?.slice(0, 2).toUpperCase() || "DR"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full" title="Active Online" />
            </div>

            <h2 className="text-xl font-bold text-foreground">{formData.name}</h2>
            <p className="text-xs font-semibold text-primary mt-0.5">{formData.specialization}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {formData.department} Department
            </p>

            <div className="mt-4 pt-4 border-t border-border flex justify-around text-center text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Role</span>
                <Badge variant="secondary" className="mt-1 uppercase text-[10px] font-bold">
                  {user?.role || "DOCTOR"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Experience</span>
                <span className="font-bold text-foreground">{formData.experience}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">License</span>
                <span className="font-bold text-emerald-600 flex items-center gap-0.5 justify-center">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          </Card>

          {/* Compliance Card */}
          <Card className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                Profile Readiness
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">95%</span>
            </div>
            <div className="w-full bg-emerald-200/50 dark:bg-emerald-900 rounded-full h-2 mb-3 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: "95%" }} />
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
              Medical registration, clinical prescribing rights, and 2FA authentication verified for current tenure.
            </p>
          </Card>
        </div>

        {/* Right Form: Tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="personal" className="gap-1 text-xs font-semibold">
                <User className="w-3.5 h-3.5" /> Personal
              </TabsTrigger>
              <TabsTrigger value="credentials" className="gap-1 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" /> Credentials
              </TabsTrigger>
              <TabsTrigger value="privileges" className="gap-1 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Permissions
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Security
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Personal Info */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription className="text-xs">Update your public profile and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Full Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dept" className="text-xs">Clinical Department</Label>
                      <Input 
                        id="dept" 
                        value={formData.department} 
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs">Professional Bio</Label>
                    <textarea 
                      id="bio" 
                      rows={3} 
                      className="w-full p-3 bg-background border border-input rounded-md text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Credentials */}
            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clinical & Medical Credentials</CardTitle>
                  <CardDescription className="text-xs">State Medical Council and professional license registrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="license" className="text-xs">Medical Registration (MCI / SMC)</Label>
                      <Input 
                        id="license" 
                        value={formData.licenseNo} 
                        onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="spec" className="text-xs">Primary Specialization</Label>
                      <Input 
                        id="spec" 
                        value={formData.specialization} 
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Digital Prescription Signature</p>
                        <p className="text-muted-foreground text-[11px]">Auto-applied on all generated prescriptions & EMR orders</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Role & Privileges */}
            <TabsContent value="privileges">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role & Access Privileges</CardTitle>
                  <CardDescription className="text-xs">Granular system permissions assigned to your role.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-bold text-foreground">EMR & Medical Consultations</p>
                      <p className="text-muted-foreground text-[11px]">Create prescriptions, record vitals, order lab tests</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white">Granted</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-bold text-foreground">Queue & Token Call On TV</p>
                      <p className="text-muted-foreground text-[11px]">Broadcast live patient calls to waiting room screen</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white">Granted</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-bold text-foreground">Doctor OPD Schedule & Time-off</p>
                      <p className="text-muted-foreground text-[11px]">Manage weekly slots and block leave dates</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white">Granted</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-bold text-foreground">Financial Reports & Hospital Settings</p>
                      <p className="text-muted-foreground text-[11px]">Manage clinic settings and view revenue analytics</p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Admin Only</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: Security */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security & Authentication</CardTitle>
                  <CardDescription className="text-xs">Manage password, session tokens, and 2-factor authentication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <Label htmlFor="curr-pass" className="text-xs">Current Password</Label>
                    <Input id="curr-pass" type="password" placeholder="••••••••" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-pass" className="text-xs">New Password</Label>
                      <Input id="new-pass" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conf-pass" className="text-xs">Confirm New Password</Label>
                      <Input id="conf-pass" type="password" placeholder="••••••••" />
                    </div>
                  </div>

                  <Button size="sm" className="mt-2" onClick={() => toast.success("Password changed successfully!")}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
