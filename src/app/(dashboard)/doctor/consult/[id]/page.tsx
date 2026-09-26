"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, CheckCircle2, Clipboard, Stethoscope, Pill, FlaskConical, Calendar, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { AIAssistantPanel } from "@/components/consult/AIAssistantPanel";

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [showAi, setShowAi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [visit, setVisit] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // SOAP State
  const [soap, setSoap] = useState({
    chiefComplaint: "",
    vitalsBP: "",
    vitalsPulse: "",
    vitalsTemp: "",
    vitalsWeight: "",
    diagnosis: "",
    notes: ""
  });

  // Rx State
  const [medicines, setMedicines] = useState([{ name: "", dose: "", frequency: "", duration: "" }]);
  const [rxInstructions, setRxInstructions] = useState("");

  useEffect(() => {
    fetchConsultData();
  }, [id]);

  const fetchConsultData = async () => {
    try {
      const res = await fetch(`/api/doctor/consult/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAppointment(data.appointment);
        setVisit(data.visit);
        if (data.visit) {
          setSoap({
            chiefComplaint: data.visit.chiefComplaint || "",
            vitalsBP: data.visit.vitalsBP || "",
            vitalsPulse: data.visit.vitalsPulse?.toString() || "",
            vitalsTemp: data.visit.vitalsTemp?.toString() || "",
            vitalsWeight: data.visit.vitalsWeight?.toString() || "",
            diagnosis: data.visit.diagnosis || "",
            notes: data.visit.notes || "",
          });
        }
      } else {
        toast.error("Failed to load consultation data");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveSoap = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/doctor/consult/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...soap,
          vitalsPulse: soap.vitalsPulse ? parseInt(soap.vitalsPulse) : null,
          vitalsTemp: soap.vitalsTemp ? parseFloat(soap.vitalsTemp) : null,
          vitalsWeight: soap.vitalsWeight ? parseFloat(soap.vitalsWeight) : null,
        }),
      });
      if (res.ok) {
        toast.success("Consultation notes saved");
      }
    } catch (e) {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const savePrescription = async () => {
    try {
      const filteredMeds = medicines.filter(m => m.name.trim() !== "");
      if (filteredMeds.length === 0) return toast.error("Add at least one medicine");

      const res = await fetch(`/api/doctor/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          visitId: visit?.id,
          medicines: filteredMeds,
          instructions: rxInstructions
        }),
      });
      if (res.ok) {
        toast.success("Prescription saved");
      }
    } catch (e) {
      toast.error("Failed to save prescription");
    }
  };

  const completeConsultation = async () => {
    try {
      // 1. Save SOAP
      await saveSoap();
      // 2. Save Rx if there's any
      if (medicines.some(m => m.name.trim() !== "")) {
        await savePrescription();
      }
      
      // 3. Complete
      const res = await fetch(`/api/doctor/consult/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationFee: 500 }),
      });
      
      if (res.ok) {
        toast.success("Consultation completed!");
        router.push("/doctor");
      }
    } catch (e) {
      toast.error("Error completing consultation");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!appointment) return <div className="p-8 text-center text-error">Appointment not found</div>;

  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className={`flex-1 space-y-6 flex flex-col h-full pb-6 overflow-y-auto ${showAi ? 'pr-4' : ''}`}>
        <div className="flex justify-between items-center shrink-0">
          <PageHeader 
            breadcrumb={[
              { label: "Dashboard", href: "/doctor" },
              { label: "Consultation" }
            ]}
            title={`Consultation: ${appointment.patient?.name || "Patient"}`} 
            description={`Token #${appointment.tokenNumber || "-"} | Status: ${appointment.status}`} 
          />
          <div className="flex gap-3">
            <Button variant={showAi ? "default" : "outline"} className={showAi ? "bg-primary-50 text-primary hover:bg-primary-100" : ""} onClick={() => setShowAi(!showAi)}>
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" onClick={saveSoap} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm" onClick={completeConsultation}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Visit
            </Button>
          </div>
        </div>

      <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant/20 flex-1 flex flex-col min-h-[500px] overflow-hidden">
        <Tabs defaultValue="soap" className="flex flex-col h-full">
          <div className="border-b border-outline-variant/20 bg-surface-low px-4 pt-4 shrink-0">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger value="soap" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700 data-[state=active]:shadow-none rounded-none py-3 px-1">
                <Clipboard className="w-4 h-4 mr-2" />
                SOAP Notes
              </TabsTrigger>
              <TabsTrigger value="rx" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700 data-[state=active]:shadow-none rounded-none py-3 px-1">
                <Pill className="w-4 h-4 mr-2" />
                Prescription
              </TabsTrigger>
              <TabsTrigger value="lab" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700 data-[state=active]:shadow-none rounded-none py-3 px-1">
                <FlaskConical className="w-4 h-4 mr-2" />
                Lab Orders
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="soap" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <h3 className="font-medium text-sm text-on-surface uppercase tracking-wider">Vitals</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>BP (mmHg)</Label>
                      <Input value={soap.vitalsBP} onChange={e => setSoap({...soap, vitalsBP: e.target.value})} placeholder="120/80" className="bg-surface-low" />
                    </div>
                    <div>
                      <Label>Pulse (bpm)</Label>
                      <Input value={soap.vitalsPulse} onChange={e => setSoap({...soap, vitalsPulse: e.target.value})} placeholder="72" type="number" className="bg-surface-low" />
                    </div>
                    <div>
                      <Label>Temp (°F)</Label>
                      <Input value={soap.vitalsTemp} onChange={e => setSoap({...soap, vitalsTemp: e.target.value})} placeholder="98.6" type="number" step="0.1" className="bg-surface-low" />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input value={soap.vitalsWeight} onChange={e => setSoap({...soap, vitalsWeight: e.target.value})} placeholder="70" type="number" step="0.1" className="bg-surface-low" />
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-3 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-on-surface font-medium text-base">Chief Complaint (Subjective)</Label>
                    <Textarea 
                      value={soap.chiefComplaint} 
                      onChange={e => setSoap({...soap, chiefComplaint: e.target.value})} 
                      placeholder="Patient complains of..." 
                      className="min-h-[100px] bg-surface-low" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-on-surface font-medium text-base">Clinical Notes (Objective / Assessment)</Label>
                    <Textarea 
                      value={soap.notes} 
                      onChange={e => setSoap({...soap, notes: e.target.value})} 
                      placeholder="Observations, findings..." 
                      className="min-h-[120px] bg-surface-low" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-on-surface font-medium text-base">Diagnosis</Label>
                    <Input 
                      value={soap.diagnosis} 
                      onChange={e => setSoap({...soap, diagnosis: e.target.value})} 
                      placeholder="Primary diagnosis code or description" 
                      className="bg-surface-low" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rx" className="m-0 space-y-6 animate-in fade-in duration-300 max-w-4xl">
              <div>
                <h3 className="font-medium text-base text-on-surface mb-4">Medications</h3>
                <div className="space-y-3">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Input value={med.name} onChange={e => {
                          const newMeds = [...medicines];
                          newMeds[idx].name = e.target.value;
                          setMedicines(newMeds);
                        }} placeholder="Medicine name (e.g. Paracetamol 500mg)" className="bg-surface-low" />
                      </div>
                      <div className="w-32">
                        <Input value={med.dose} onChange={e => {
                          const newMeds = [...medicines];
                          newMeds[idx].dose = e.target.value;
                          setMedicines(newMeds);
                        }} placeholder="Dose (1 tab)" className="bg-surface-low" />
                      </div>
                      <div className="w-32">
                        <Input value={med.frequency} onChange={e => {
                          const newMeds = [...medicines];
                          newMeds[idx].frequency = e.target.value;
                          setMedicines(newMeds);
                        }} placeholder="Freq (1-0-1)" className="bg-surface-low" />
                      </div>
                      <div className="w-32">
                        <Input value={med.duration} onChange={e => {
                          const newMeds = [...medicines];
                          newMeds[idx].duration = e.target.value;
                          setMedicines(newMeds);
                        }} placeholder="Days (5)" className="bg-surface-low" />
                      </div>
                      <Button variant="ghost" className="text-error" onClick={() => {
                        setMedicines(medicines.filter((_, i) => i !== idx));
                      }}>X</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setMedicines([...medicines, { name: "", dose: "", frequency: "", duration: "" }])}>
                    + Add Medicine
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label>General Instructions / Diet</Label>
                <Textarea value={rxInstructions} onChange={e => setRxInstructions(e.target.value)} placeholder="Take medicine after food..." className="bg-surface-low" />
              </div>
            </TabsContent>
            
            <TabsContent value="lab" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="text-center p-12 text-on-surface-variant">
                <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Lab Orders feature coming soon in Phase 4.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      </div>
      <AIAssistantPanel 
        patientId={appointment.patientId} 
        isOpen={showAi} 
        onClose={() => setShowAi(false)}
        soap={soap}
        medicines={medicines}
      />
    </div>
  );
}
