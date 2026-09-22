'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PatientTable } from '@/features/patients/components/PatientTable';

export default function PatientsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Patients" 
        description="Manage patient records and histories"
        action={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            + Add Patient
          </button>
        }
      />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4 mb-4 border-b pb-4">
          <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">All Patients</button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-800 pb-1">New (This Month)</button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-800 pb-1">Returning</button>
        </div>
        <PatientTable />
      </div>
    </div>
  );
}
