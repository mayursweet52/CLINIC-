'use client';
import React from 'react';
import { usePatient } from '@/features/patients/hooks';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Edit, CalendarPlus, AlertTriangle, FileText, FlaskConical, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

// Inline VitalCard
function VitalCard({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'normal' | 'warning' | 'critical', trend?: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-low border border-outline-variant/20">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-on-surface-variant">{label}</span>
        {status === 'normal' && <CheckCircle2 className="h-3.5 w-3.5 text-medical-green" />}
        {status === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-tertiary-700" />}
        {status === 'critical' && <AlertTriangle className="h-3.5 w-3.5 text-error" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-on-surface">{value}</span>
        <span className="text-xs text-on-surface-variant">{unit}</span>
      </div>
    </div>
  );
}

// Inline DetailRow
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

export function PatientDetailClient({ id }: { id: string }) {
  const { data: patient, isLoading } = usePatient(id);

  const currentPatient = patient || {
    id,
    name: 'Jane Doe',
    patientCode: 'PT-2024-892',
    phone: '+1 555-0198',
    email: 'jane.doe@example.com',
    age: 32,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Asthma'],
    status: 'ACTIVE',
    insurance: 'Blue Cross Blue Shield'
  };

  const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || 'U';

  // Mock data for tabs
  const soapNotes = [
    { date: new Date(), doctorName: 'Dr. Ananya Sharma', subjective: 'Patient reports mild headache.', objective: 'Vitals stable. BP 120/80.', assessment: 'Tension headache.', plan: 'Rest and hydration.' }
  ];
  
  const labReports = [
    { testName: 'Complete Blood Count (CBC)', date: new Date(Date.now() - 86400000 * 2), status: 'COMPLETED' },
    { testName: 'Lipid Profile', date: new Date(), status: 'PENDING' }
  ];
  
  const prescriptions = [
    { medicineName: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice a day', duration: '5 days', status: 'ACTIVE' }
  ];

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant">Loading patient record...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="sticky top-20 z-30 bg-surface-lowest/95 backdrop-blur-md border-b border-outline-variant/20 -mx-8 px-8 py-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
              {getInitials(currentPatient.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-on-surface">{currentPatient.name}</h1>
                <StatusBadge status={currentPatient.status || "ACTIVE"} />
              </div>
              <p className="text-sm text-on-surface-variant mt-0.5">
                ID: {currentPatient.patientCode} • {currentPatient.age}y, {currentPatient.gender} • {currentPatient.bloodGroup}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-surface-lowest">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" className="bg-primary-500 text-white hover:bg-primary-600">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-surface-low rounded-lg p-1 inline-flex h-auto mb-6 flex-wrap gap-1">
          <TabsTrigger value="overview" className="px-4 py-2 rounded-md data-[state=active]:bg-primary-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="soap" className="px-4 py-2 rounded-md data-[state=active]:bg-primary-500 data-[state=active]:text-white">
            SOAP Notes
          </TabsTrigger>
          <TabsTrigger value="labs" className="px-4 py-2 rounded-md data-[state=active]:bg-primary-500 data-[state=active]:text-white">
            Labs & DICOM
          </TabsTrigger>
          <TabsTrigger value="rx" className="px-4 py-2 rounded-md data-[state=active]:bg-primary-500 data-[state=active]:text-white">
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="billing" className="px-4 py-2 rounded-md data-[state=active]:bg-primary-500 data-[state=active]:text-white">
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <VitalCard label="Blood Pressure" value="128/82" unit="mmHg" status="normal" trend="stable" />
            <VitalCard label="Heart Rate" value="72" unit="bpm" status="normal" />
            <VitalCard label="SpO2" value="98" unit="%" status="normal" />
          </div>

          <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-error" />
              <h3 className="font-semibold text-on-surface">Allergies & Medical Alerts</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentPatient.allergies?.map((a: string) => (
                <span key={a} className="px-3 py-1 rounded-lg bg-error-container text-error text-xs font-medium">
                  {a} (Severe)
                </span>
              ))}
              {currentPatient.chronicConditions?.map((c: string) => (
                <span key={c} className="px-3 py-1 rounded-lg bg-tertiary-100 text-tertiary-700 text-xs font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-on-surface">Recent Clinical Note</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-low p-3 rounded-lg italic">
              "Patient presents for routine follow-up. Reports mild exertional dyspnea but no chest pain. Advised to continue current regimen."
            </p>
          </div>
        </TabsContent>

        <TabsContent value="soap">
          <div className="space-y-4">
            {soapNotes.map((note, i) => (
              <div key={i} className="border-l-4 border-primary-500 bg-surface-lowest shadow-sm rounded-r-lg p-4 border-y border-r border-outline-variant/20">
                <div className="flex items-center justify-between mb-3 border-b border-outline-variant/20 pb-2">
                  <span className="text-xs font-semibold text-primary-600">
                    SOAP Note • {format(note.date, "dd MMM, yyyy")}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {note.doctorName}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-on-surface">
                  <p><strong className="text-on-surface-variant">S:</strong> {note.subjective}</p>
                  <p><strong className="text-on-surface-variant">O:</strong> {note.objective}</p>
                  <p><strong className="text-on-surface-variant">A:</strong> {note.assessment}</p>
                  <p><strong className="text-on-surface-variant">P:</strong> {note.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="labs">
          <div className="space-y-3">
            {labReports.map((lab, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <FlaskConical className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-on-surface">{lab.testName}</p>
                    <p className="text-xs text-on-surface-variant">
                      {format(lab.date, "dd MMM, yyyy")}
                    </p>
                  </div>
                </div>
                <StatusBadge status={lab.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rx">
          <div className="space-y-3">
            {prescriptions.map((rx, i) => (
              <div key={i} className="p-4 bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm text-on-surface">{rx.medicineName}</p>
                  <StatusBadge status={rx.status} />
                </div>
                <p className="text-xs text-on-surface-variant">
                  {rx.dosage} • {rx.frequency} • {rx.duration}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="bg-surface-lowest rounded-xl shadow-sm p-6 space-y-3 border border-outline-variant/20">
            <DetailRow label="Insurance Provider" value={currentPatient.insurance || "Self-pay"} />
            <DetailRow label="Policy Number" value="BCBS-9928104-X" />
            <DetailRow label="Copay Status" value="Verified ($25.00)" />
            <DetailRow label="Outstanding Balance" value="$0.00 (Paid in Full)" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
