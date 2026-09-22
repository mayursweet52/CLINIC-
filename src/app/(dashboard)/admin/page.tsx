"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Users, Activity, CreditCard, Stethoscope } from "lucide-react";
import { PermissionGate } from "@/components/shared/PermissionGate";

export default function AdminOverview() {
  const [stats, setStats] = useState({ staff: 0, patients: 0, appointments: 0 });

  useEffect(() => {
    // Quick mock fetch for stats until specialized API is ready
    Promise.all([
      fetch("/api/staff").then(r => r.json()),
      fetch("/api/patients").then(r => r.json()),
      fetch("/api/appointments").then(r => r.json())
    ]).then(([staffRes, patientRes, apptRes]) => {
      setStats({
        staff: staffRes.length || 0,
        patients: patientRes.length || 0,
        appointments: apptRes.length || 0
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admin Overview" 
        description="Monitor clinic metrics and operations"
      />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PermissionGate permission="user:manage">
          <StatCard
            title="Total Staff"
            value={stats.staff}
            icon={Users}
          />
        </PermissionGate>
        
        <PermissionGate permission="patient:read">
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon={Activity}
          />
        </PermissionGate>

        <PermissionGate permission="appointment:read">
          <StatCard
            title="Appointments"
            value={stats.appointments}
            icon={Stethoscope}
          />
        </PermissionGate>
        
        <PermissionGate permission="bill:read">
          <StatCard
            title="Revenue"
            value="N/A"
            icon={CreditCard}
          />
        </PermissionGate>
      </div>
    </div>
  );
}
