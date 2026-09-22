import React from 'react';

export function PatientHeader({ patient }: { patient: any }) {
  if (!patient) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700">
          {patient.name?.charAt(0) || 'P'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{patient.patientCode || 'PT-XXXX'}</span>
            <span>{patient.phone}</span>
            {patient.email && <span>{patient.email}</span>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex gap-2 mr-4">
          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">{patient.age || 30} yrs</span>
          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">{patient.gender}</span>
          {patient.bloodGroup && (
            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full font-medium">{patient.bloodGroup}</span>
          )}
        </div>
        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm">
          Edit
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
          Book Appointment
        </button>
      </div>
    </div>
  );
}
