"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionGate } from "@/components/shared/PermissionGate";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Settings" 
        description="Manage clinic preferences and integrations"
      />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clinic Profile</CardTitle>
            <CardDescription>Update your clinic's name, address, and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Clinic Name</p>
                <p className="text-sm text-muted-foreground">City Care Super Multi-Speciality Hospital</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Contact Phone</p>
                <p className="text-sm text-muted-foreground">+91-9876543210</p>
              </div>
            </div>
            
            <PermissionGate permission="settings:manage">
              <Button>Edit Profile</Button>
            </PermissionGate>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing & Insurance</CardTitle>
            <CardDescription>Configure supported insurance providers and payment gateways.</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionGate permission="settings:manage">
              <Button variant="outline">Configure Billing</Button>
            </PermissionGate>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
