"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, User, Calendar, Activity, Pill, Receipt, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

export default function DoctorPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/doctor/patients/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPatient(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading chart...</div>;
  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-error-container text-on-error-container rounded-xl text-center">
      <AlertCircle className="w-10 h-10 mx-auto mb-4" />
      <h2 className="text-lg font-bold mb-2">Access Denied</h2>
      <p className="mb-6">{error}</p>
      <Button variant="outline" asChild><a href="/doctor/patients">Back to My Patients</a></Button>
    </div>
  );
  if (!patient) return <div>Not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Button variant="ghost" asChild className="mb-2 -ml-2 text-on-surface-variant">
        <a href="/doctor/patients"><ArrowLeft className="w-4 h-4 mr-2" /> Back to My Patients</a>
      </Button>

      <div className="bg-surface-lowest border border-outline-variant rounded-xl p-6 sticky top-20 z-30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl">
              {patient.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{patient.name}</h1>
                <StatusBadge status="ACTIVE" />
              </div>
              <p className="text-on-surface-variant text-sm mt-1">
                {patient.patientCode} • {patient.age}y, {patient.gender} • Blood: {patient.bloodGroup || "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Schedule Follow-up</Button>
            <Button>Add Clinical Note</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-surface border border-outline-variant w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2"><Activity className="w-4 h-4"/> Overview</TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center gap-2"><FileText className="w-4 h-4"/> Consultations</TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-2"><Pill className="w-4 h-4"/> Prescriptions</TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2"><Receipt className="w-4 h-4"/> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-lowest border border-outline-variant rounded-xl p-4">
              <h3 className="font-semibold text-sm text-on-surface-variant mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Total Visits</span><span className="font-medium">{patient.appointments?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Last Visit</span><span className="font-medium">{patient.appointments?.[0] ? new Date(patient.appointments[0].appointmentDate).toLocaleDateString() : "-"}</span></div>
              </div>
            </div>
            <div className="bg-surface-lowest border border-outline-variant rounded-xl p-4 md:col-span-2">
              <h3 className="font-semibold text-sm text-on-surface-variant mb-4">Medical History</h3>
              <p className="text-sm text-on-surface-variant italic">No active chronic conditions or allergies recorded.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="pt-4">
          <div className="bg-surface-lowest border border-outline-variant rounded-xl overflow-hidden">
            {patient.appointments?.length === 0 ? (
              <EmptyState title="No consultations yet" description="No past appointments found." icon={FileText} action={<div/>}/>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-surface text-on-surface-variant text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Token</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {patient.appointments?.map((a: any) => (
                    <tr key={a.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{new Date(a.appointmentDate).toLocaleDateString()} at {a.timeSlot}</td>
                      <td className="px-4 py-3">{a.tokenDisplay}</td>
                      <td className="px-4 py-3 text-on-surface-variant max-w-[200px] truncate">{a.reason}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="pt-4">
          <div className="bg-surface-lowest border border-outline-variant rounded-xl overflow-hidden">
            {patient.prescriptions?.length === 0 ? (
              <EmptyState title="No prescriptions yet" description="You have not written any prescriptions for this patient." icon={Pill} action={<div/>}/>
            ) : (
              <div className="p-4 text-center text-sm text-on-surface-variant">Prescriptions module coming soon.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
          <div className="bg-surface-lowest border border-outline-variant rounded-xl overflow-hidden">
            {patient.appointments?.filter((a: any) => a.billing).length === 0 ? (
              <EmptyState title="No bills yet" description="No billing records found for your consultations." icon={Receipt} action={<div/>}/>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-surface text-on-surface-variant text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {patient.appointments?.filter((a: any) => a.billing).map((a: any) => (
                    <tr key={a.billing.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{new Date(a.appointmentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">₹{a.billing.totalAmount}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.billing.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
