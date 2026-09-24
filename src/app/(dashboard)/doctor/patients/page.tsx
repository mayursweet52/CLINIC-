"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users, Calendar, Clock, AlertCircle, Search, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Patient = {
  id: string;
  name: string;
  patientCode: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string | null;
  lastVisit: string | null;
  totalVisits: number;
};

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/patients");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients);
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.patientCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Patients" 
        description="Patients you have treated"
        breadcrumb={[
          { label: "Dashboard", href: "/doctor" },
          { label: "My Patients" }
        ]}
        action={<Button onClick={fetchPatients} variant="outline">Refresh</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={patients.length.toString()} icon={Users} color="primary" trend={{ value: "+2 this week", isUp: true }} />
        <StatCard label="This Month" value="0" icon={Calendar} color="secondary" />
        <StatCard label="Follow-ups Due" value="0" icon={Clock} color="info" />
        <StatCard label="Critical" value="0" icon={AlertCircle} color="error" />
      </div>

      <div className="flex gap-2 items-center max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
          <Input 
            placeholder="Search patients..." 
            className="pl-8" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg">{error}</div>
      ) : loading ? (
        <div className="p-8 text-center text-on-surface-variant">Loading patients...</div>
      ) : patients.length === 0 ? (
        <EmptyState 
          title="No patients yet" 
          description="You have not treated any patients yet."
          icon={Users}
          action={<div/>}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main List */}
          <div className="flex-1 bg-surface-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-on-surface-variant text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Age/Gender</th>
                  <th className="px-4 py-3 hidden md:table-cell">Last Visit</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map(p => (
                  <tr 
                    key={p.id} 
                    className={cn(
                      "hover:bg-primary/5 cursor-pointer transition-colors",
                      selectedPatientId === p.id && "bg-primary/10"
                    )}
                    onClick={() => setSelectedPatientId(p.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                          {p.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-on-surface">{p.name}</div>
                          <div className="text-xs text-on-surface-variant">{p.patientCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-on-surface-variant">
                      {p.age}y, {p.gender[0]}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-on-surface-variant">
                      {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-surface-high px-2 py-1 rounded-md text-xs font-medium">{p.totalVisits}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 inline-block text-on-surface-variant" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant">No matches found for "{searchQuery}"</div>
            )}
          </div>

          {/* Inspector Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {selectedPatient ? (
              <div className="bg-surface-lowest border border-outline-variant rounded-xl p-5 sticky top-24">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl mb-3">
                    {selectedPatient.name[0]}
                  </div>
                  <h3 className="font-bold text-lg">{selectedPatient.name}</h3>
                  <p className="text-sm text-on-surface-variant">{selectedPatient.patientCode}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Age/Gender</span>
                    <span className="font-medium">{selectedPatient.age}y, {selectedPatient.gender}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Blood Group</span>
                    <span className="font-medium">{selectedPatient.bloodGroup || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Phone</span>
                    <span className="font-medium">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Total Visits</span>
                    <span className="font-medium">{selectedPatient.totalVisits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Last Visit</span>
                    <span className="font-medium">
                      {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="w-full" asChild>
                    <a href={`/doctor/patients/${selectedPatient.id}`}>Open Full Chart</a>
                  </Button>
                  <Button variant="outline" className="w-full">Schedule Follow-up</Button>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-outline-variant border-dashed rounded-xl p-8 text-center text-on-surface-variant flex flex-col items-center justify-center h-[300px]">
                <User className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
