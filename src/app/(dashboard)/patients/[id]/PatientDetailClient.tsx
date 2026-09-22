'use client';
import React, { useState } from 'react';
import { usePatient } from '@/features/patients/hooks';
import { PatientHeader } from '@/features/patients/components/PatientHeader';
import { VisitTimeline } from '@/features/patients/components/VisitTimeline';
import { VitalsChart } from '@/features/patients/components/VitalsChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { Calendar as CalendarIcon } from 'lucide-react';

export function PatientDetailClient({ id }: { id: string }) {
  const { data: patient, isLoading } = usePatient(id);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'lab', label: 'Lab Reports' },
    { id: 'bills', label: 'Bills' },
    { id: 'vitals', label: 'Vitals' },
  ];

  const currentPatient = patient || {
    id,
    name: 'Jane Doe',
    patientCode: 'PT-2024-892',
    phone: '+1 555-0198',
    email: 'jane.doe@example.com',
    age: 32,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts']
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PatientHeader patient={currentPatient} />
      
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Visits</h3>
                  <VisitTimeline visits={[]} />
                </section>
              </div>
              <div className="space-y-6">
                <section className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Allergies</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentPatient.allergies?.map((a: string) => (
                      <span key={a} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">{a}</span>
                    ))}
                  </div>
                </section>
                <section className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Upcoming Appointments</h3>
                  <EmptyState icon={CalendarIcon} title="No upcoming appointments" />
                </section>
              </div>
            </div>
          )}
          
          {activeTab === 'vitals' && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Vitals History</h3>
              <VitalsChart vitals={[]} />
            </div>
          )}
          
          {['appointments', 'prescriptions', 'lab', 'bills'].includes(activeTab) && (
            <EmptyState icon={CalendarIcon} title={`No ${activeTab} records found for this patient.`} />
          )}
        </div>
      </div>
    </div>
  );
}
