'use client';
import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SplitPane } from '@/components/shared/SplitPane';
import { InspectorPanel } from '@/components/shared/InspectorPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  FlaskConical, 
  Pill, 
  Activity, 
  Search, 
  Stethoscope, 
  Calendar, 
  User, 
  ExternalLink, 
  Heart, 
  ShieldCheck, 
  Clock, 
  Thermometer, 
  TrendingUp, 
  FolderPlus 
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

function LiveBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-medical-green/10 text-medical-green rounded-full text-sm font-medium border border-medical-green/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-green opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-green"></span>
      </span>
      EHR Live Sync
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10 last:border-none">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

const DEFAULT_EHR_RECORDS = [
  {
    id: 'REC-2024-001',
    patientId: 'pat-101',
    patientCode: 'PAT-1001',
    patientName: 'Rahul Deshmukh',
    age: 32,
    gender: 'Male',
    bloodGroup: 'B+',
    recordType: 'Consultation',
    doctorName: 'Dr. Ananya Sharma',
    department: 'General Medicine',
    date: new Date().toISOString(),
    status: 'COMPLETED',
    chiefComplaint: 'Persistent throbbing headache and neck stiffness for 4 days',
    diagnosis: 'Tension-Type Headache & Cervical Strain',
    vitals: {
      bp: '126/82 mmHg',
      pulse: '74 bpm',
      temp: '98.6 °F',
      weight: '72 kg',
      spo2: '99%'
    },
    soap: {
      subjective: '32-year-old male with dull bilateral forehead ache aggravated by prolonged screen time.',
      objective: 'Alert, oriented. Neck ROM mildly restricted due to paraspinal muscle tenderness. Cranial nerves intact.',
      assessment: 'Episodic tension headache exacerbated by postural cervical strain.',
      plan: 'Postural ergonomic correction, heat pack application, hydration, 5-day course of NSAID + PPI.'
    },
    prescriptions: [
      { medicineName: 'Naproxen Sodium 500mg', dosage: '1 tab', frequency: 'Twice daily after meals', duration: '5 days' },
      { medicineName: 'Pantoprazole 40mg', dosage: '1 tab', frequency: 'Once daily before breakfast', duration: '5 days' }
    ],
    labTests: ['Complete Blood Count (CBC) - Normal', 'Serum Electrolytes - Normal']
  },
  {
    id: 'REC-2024-002',
    patientId: 'pat-102',
    patientCode: 'PAT-1002',
    patientName: 'Priya Patel',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    recordType: 'Lab Report',
    doctorName: 'Dr. Rajesh Patel',
    department: 'Pulmonology',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'VERIFIED',
    chiefComplaint: 'Follow-up for seasonal bronchospasm and nocturnal cough',
    diagnosis: 'Mild Persistent Asthma (Controlled)',
    vitals: {
      bp: '118/76 mmHg',
      pulse: '78 bpm',
      temp: '98.4 °F',
      weight: '58 kg',
      spo2: '98%'
    },
    soap: {
      subjective: 'Mild nocturnal wheeze during cold weather. No acute dyspnea episodes.',
      objective: 'Chest clear bilaterally on auscultation. Peak expiratory flow rate 420 L/min (92% predicted).',
      assessment: 'Mild bronchial hyperreactivity under adequate controller therapy.',
      plan: 'Continue low dose inhaled Budesonide/Formoterol. Avoid dust exposure.'
    },
    prescriptions: [
      { medicineName: 'Budesonide + Formoterol Inhaler (200/6mcg)', dosage: '2 puffs', frequency: 'Twice daily', duration: '30 days' },
      { medicineName: 'Levocetirizine 5mg', dosage: '1 tab', frequency: 'At bedtime SOS', duration: '10 days' }
    ],
    labTests: ['Spirometry / PEFR - Within normal limit (420 L/min)']
  },
  {
    id: 'REC-2024-003',
    patientId: 'pat-103',
    patientCode: 'PAT-1003',
    patientName: 'Amit Verma',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A+',
    recordType: 'Prescription',
    doctorName: 'Dr. Vikram Singh',
    department: 'Endocrinology',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'FOLLOW_UP',
    chiefComplaint: 'Routine diabetes check-up & quarterly HbA1c review',
    diagnosis: 'Type 2 Diabetes Mellitus & Dyslipidemia',
    vitals: {
      bp: '134/86 mmHg',
      pulse: '80 bpm',
      temp: '98.6 °F',
      weight: '84 kg',
      spo2: '97%'
    },
    soap: {
      subjective: 'Compliance with dietary restriction moderate. Walking 30 mins daily. Occasional foot numbness.',
      objective: 'BMI 28.2. Bilateral peripheral pulses palpable. Monofilament test normal.',
      assessment: 'Suboptimally controlled T2DM (HbA1c 7.4%).',
      plan: 'Uptitrate Metformin, add lifestyle counseling, repeat fasting blood sugar in 4 weeks.'
    },
    prescriptions: [
      { medicineName: 'Metformin Hydrochloride 1000mg ER', dosage: '1 tab', frequency: 'Twice daily with meals', duration: '90 days' },
      { medicineName: 'Atorvastatin 10mg', dosage: '1 tab', frequency: 'At night', duration: '90 days' }
    ],
    labTests: ['HbA1c - 7.4%', 'Fasting Blood Glucose - 138 mg/dL', 'Lipid Profile - Mild hypercholesterolemia']
  },
  {
    id: 'REC-2024-004',
    patientId: 'pat-104',
    patientCode: 'PAT-1004',
    patientName: 'Sneha Kulkarni',
    age: 35,
    gender: 'Female',
    bloodGroup: 'AB+',
    recordType: 'Consultation',
    doctorName: 'Dr. Ananya Sharma',
    department: 'General Medicine',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'COMPLETED',
    chiefComplaint: 'Post-viral fatigue, dizziness, and low energy levels',
    diagnosis: 'Post-Viral Asthenia & Mild Microcytic Anemia',
    vitals: {
      bp: '112/70 mmHg',
      pulse: '72 bpm',
      temp: '98.2 °F',
      weight: '54 kg',
      spo2: '99%'
    },
    soap: {
      subjective: 'Recovered from acute viral fever 10 days ago, now experiencing fatigue on minimal exertion.',
      objective: 'Mild conjunctival pallor. Heart sounds normal. Lungs clear.',
      assessment: 'Microcytic hypochromic anemia (Hemoglobin 10.2 g/dL), post-viral convalescence.',
      plan: 'Oral elemental iron supplementation with Vitamin C, high protein diet, hydration.'
    },
    prescriptions: [
      { medicineName: 'Ferrous Ascorbate + Folic Acid', dosage: '1 tab', frequency: 'Once daily after lunch', duration: '60 days' },
      { medicineName: 'Multivitamin & Zinc Complex', dosage: '1 capsule', frequency: 'Once daily in morning', duration: '30 days' }
    ],
    labTests: ['Complete Blood Count (CBC) - Hb 10.2 g/dL, MCV 74 fL', 'Serum Ferritin - 18 ng/mL']
  },
  {
    id: 'REC-2024-005',
    patientId: 'pat-105',
    patientCode: 'PAT-1005',
    patientName: 'Vikram Mehta',
    age: 52,
    gender: 'Male',
    bloodGroup: 'O-',
    recordType: 'Lab Report',
    doctorName: 'Dr. Vikram Singh',
    department: 'Cardiology',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'VERIFIED',
    chiefComplaint: 'Annual cardiac wellness review & ECG screening',
    diagnosis: 'Stage 1 Primary Hypertension',
    vitals: {
      bp: '142/90 mmHg',
      pulse: '76 bpm',
      temp: '98.4 °F',
      weight: '79 kg',
      spo2: '98%'
    },
    soap: {
      subjective: 'Asymptomatic. No exertional chest tightness or shortness of breath.',
      objective: 'BP 142/90 right arm sitting. S1 S2 normal. Resting 12-lead ECG normal sinus rhythm.',
      assessment: 'Essential hypertension stage 1, low ASCVD 10-year risk profile.',
      plan: 'DASH diet, salt reduction (<5g/day), Telmisartan 40mg initiated, BP diary maintain.'
    },
    prescriptions: [
      { medicineName: 'Telmisartan 40mg', dosage: '1 tab', frequency: 'Once daily morning', duration: '60 days' }
    ],
    labTests: ['12-Lead ECG - Normal Sinus Rhythm (HR 74)', 'Serum Creatinine - 0.9 mg/dL']
  }
];

export default function MedicalRecordsPage() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['medical-records'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/records');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Error fetching /api/records, falling back to local dataset', err);
      }
      return DEFAULT_EHR_RECORDS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const totalRecords = records.length;
  const consultationsCount = records.filter((r: any) => r.recordType === 'Consultation').length;
  const labReportsCount = records.filter((r: any) => r.recordType === 'Lab Report').length;
  const prescriptionsCount = records.filter((r: any) => r.recordType === 'Prescription').length;

  const filteredRecords = records
    .filter((r: any) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        r.patientName?.toLowerCase().includes(query) ||
        r.patientCode?.toLowerCase().includes(query) ||
        r.diagnosis?.toLowerCase().includes(query) ||
        r.doctorName?.toLowerCase().includes(query) ||
        r.id?.toLowerCase().includes(query);

      const matchType = typeFilter === 'all' || r.recordType?.toLowerCase() === typeFilter.toLowerCase();

      return matchSearch && matchType;
    });

  const activeRecord = selectedRecord || (filteredRecords.length > 0 ? filteredRecords[0] : null);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        label="Medical Records (EHR)"
        description="Electronic Health Records, clinical consultations, diagnostics, and prescriptions history"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Medical Records', href: '/records' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <LiveBadge />
            <Button size="sm" className="bg-primary-500 text-white hover:bg-primary-600 gap-1.5 shadow-sm">
              <FolderPlus className="h-4 w-4" />
              New Clinical Note
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL EHR RECORDS"
          value={totalRecords.toString()}
          icon={FileText}
        />
        <StatCard
          label="CONSULTATIONS"
          value={consultationsCount.toString()}
          icon={Stethoscope}
        />
        <StatCard
          label="LAB REPORTS"
          value={labReportsCount.toString()}
          icon={FlaskConical}
        />
        <StatCard
          label="PRESCRIPTIONS"
          value={prescriptionsCount.toString()}
          icon={Pill}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search patient, ID, diagnosis, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-low rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-surface-low border-none">
              <SelectValue placeholder="Record Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultations</SelectItem>
              <SelectItem value="lab report">Lab Reports</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Split Pane: Records Table & Detail Inspector */}
      {isLoading ? (
        <TableSkeleton cols={6} rows={5} />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          label="No medical records found"
          description="Try adjusting your search criteria or filter to locate patient health records."
          // "Clear Search"
          onAction={() => {
            setSearchQuery('');
            setTypeFilter('all');
          }}
        />
      ) : (
        <SplitPane
          main={
            <div className="bg-surface-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
                <h3 className="font-semibold text-on-surface flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-500" />
                  Health Records List
                </h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  Showing {filteredRecords.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-low text-xs text-on-surface-variant uppercase font-medium border-b border-outline-variant/20">
                    <tr>
                      <th className="py-3 px-4">Record ID</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Diagnosis / Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredRecords.map((record: any) => {
                      const isSelected = activeRecord?.id === record.id;
                      return (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className={`cursor-pointer transition-colors hover:bg-surface-low/60 ${
                            isSelected ? 'bg-primary-500/5 font-medium' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                            {record.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-on-surface">{record.patientName}</div>
                            <div className="text-xs text-on-surface-variant">
                              {record.patientCode} • {record.age}y, {record.gender}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                              {record.recordType === 'Lab Report' ? (
                                <FlaskConical className="h-3 w-3" />
                              ) : record.recordType === 'Prescription' ? (
                                <Pill className="h-3 w-3" />
                              ) : (
                                <Stethoscope className="h-3 w-3" />
                              )}
                              {record.recordType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-on-surface">
                            <div>{record.doctorName}</div>
                            <div className="text-xs text-on-surface-variant">{record.department}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px] truncate text-on-surface">
                            {record.diagnosis}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={record.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                              View EHR →
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          }
          inspector={
            <InspectorPanel
              isOpen={Boolean(activeRecord)}
              onClose={() => setSelectedRecord(null)}
              label="Record Summary"
              description={activeRecord?.id}
            >
              {activeRecord && (
                <div className="space-y-6">
                  {/* Patient Identity Header */}
                  <div className="p-4 bg-surface-low rounded-xl border border-outline-variant/30 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center font-bold text-base shrink-0">
                      {activeRecord.patientName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-on-surface truncate">{activeRecord.patientName}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        {activeRecord.patientCode} • {activeRecord.age} yrs • Blood: {activeRecord.bloodGroup}
                      </div>
                    </div>
                    <Link href={`/patients/${activeRecord.patientId}`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                        Profile <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  {/* Vitals Snapshot */}
                  {activeRecord.vitals && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-medical-green" /> Recorded Vitals
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-surface-lowest rounded-lg border border-outline-variant/20">
                          <span className="text-xs text-on-surface-variant">Blood Pressure</span>
                          <p className="text-sm font-semibold text-on-surface">{activeRecord.vitals.bp}</p>
                        </div>
                        <div className="p-2.5 bg-surface-lowest rounded-lg border border-outline-variant/20">
                          <span className="text-xs text-on-surface-variant">Heart Pulse</span>
                          <p className="text-sm font-semibold text-on-surface">{activeRecord.vitals.pulse}</p>
                        </div>
                        <div className="p-2.5 bg-surface-lowest rounded-lg border border-outline-variant/20">
                          <span className="text-xs text-on-surface-variant">Temperature</span>
                          <p className="text-sm font-semibold text-on-surface">{activeRecord.vitals.temp}</p>
                        </div>
                        <div className="p-2.5 bg-surface-lowest rounded-lg border border-outline-variant/20">
                          <span className="text-xs text-on-surface-variant">Weight / SpO2</span>
                          <p className="text-sm font-semibold text-on-surface">
                            {activeRecord.vitals.weight} • {activeRecord.vitals.spo2}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clinical Details */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider mb-2">
                      Clinical Overview
                    </h4>
                    <div className="bg-surface-lowest p-3 rounded-lg border border-outline-variant/20 space-y-1">
                      <DetailRow label="Record Type" value={activeRecord.recordType} />
                      <DetailRow label="Encounter Date" value={format(new Date(activeRecord.date), 'dd MMM yyyy, hh:mm a')} />
                      <DetailRow label="Attending Doctor" value={activeRecord.doctorName} />
                      <DetailRow label="Department" value={activeRecord.department} />
                      <DetailRow label="Status" value={<StatusBadge status={activeRecord.status} />} />
                    </div>
                  </div>

                  {/* Chief Complaint & Diagnosis */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider mb-2">
                      Diagnosis & Findings
                    </h4>
                    <div className="p-3 bg-surface-lowest rounded-lg border border-outline-variant/20 space-y-2">
                      <div>
                        <span className="text-xs text-on-surface-variant font-medium">Chief Complaint:</span>
                        <p className="text-sm text-on-surface mt-0.5">{activeRecord.chiefComplaint}</p>
                      </div>
                      <div className="pt-2 border-t border-outline-variant/10">
                        <span className="text-xs text-on-surface-variant font-medium">Final Diagnosis:</span>
                        <p className="text-sm font-semibold text-primary-700 mt-0.5">{activeRecord.diagnosis}</p>
                      </div>
                    </div>
                  </div>

                  {/* SOAP Notes */}
                  {activeRecord.soap && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary-500" /> SOAP Clinical Notes
                      </h4>
                      <div className="p-3 bg-surface-lowest rounded-lg border border-outline-variant/20 space-y-2 text-xs">
                        <div>
                          <strong className="text-on-surface">Subjective (S):</strong>
                          <p className="text-on-surface-variant mt-0.5">{activeRecord.soap.subjective}</p>
                        </div>
                        <div>
                          <strong className="text-on-surface">Objective (O):</strong>
                          <p className="text-on-surface-variant mt-0.5">{activeRecord.soap.objective}</p>
                        </div>
                        <div>
                          <strong className="text-on-surface">Assessment (A):</strong>
                          <p className="text-on-surface-variant mt-0.5">{activeRecord.soap.assessment}</p>
                        </div>
                        <div>
                          <strong className="text-on-surface">Plan (P):</strong>
                          <p className="text-on-surface-variant mt-0.5">{activeRecord.soap.plan}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Prescriptions */}
                  {activeRecord.prescriptions && activeRecord.prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider mb-2 flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5 text-secondary-600" /> Medications Prescribed
                      </h4>
                      <div className="space-y-1.5">
                        {activeRecord.prescriptions.map((rx: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-surface-lowest rounded-lg border border-outline-variant/20 text-xs">
                            <div className="font-semibold text-on-surface">{rx.medicineName}</div>
                            <div className="text-on-surface-variant mt-0.5">
                              {rx.dosage} • {rx.frequency} • {rx.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Tests */}
                  {activeRecord.labTests && activeRecord.labTests.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider mb-2 flex items-center gap-1.5">
                        <FlaskConical className="h-3.5 w-3.5 text-medical-green" /> Associated Diagnostics
                      </h4>
                      <div className="space-y-1">
                        {activeRecord.labTests.map((test: string, idx: number) => (
                          <div key={idx} className="p-2 bg-surface-lowest rounded-lg border border-outline-variant/20 text-xs font-medium text-on-surface">
                            {test}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </InspectorPanel>
          }
        />
      )}
    </div>
  );
}
