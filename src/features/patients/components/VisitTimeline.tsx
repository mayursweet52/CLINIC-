import React from 'react';

export function VisitTimeline({ visits }: { visits: any[] }) {
  const mockVisits = visits?.length ? visits : [
    { id: 1, date: '2024-04-05', doctor: 'Dr. Smith', diagnosis: 'Common Cold', type: 'Consultation' },
    { id: 2, date: '2024-03-20', doctor: 'Dr. Jones', diagnosis: 'Annual Checkup', type: 'Checkup' },
    { id: 3, date: '2023-11-15', doctor: 'Dr. Smith', diagnosis: 'Flu', type: 'Consultation' },
  ];

  return (
    <div className="space-y-6">
      {mockVisits.map((visit, idx) => (
        <div key={visit.id} className="relative pl-6 pb-6 border-l-2 border-blue-100 last:pb-0 last:border-0">
          <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 border-2 border-white"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{new Date(visit.date).toLocaleDateString()}</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">{visit.type}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Seen by <span className="font-medium text-slate-800 dark:text-slate-200">{visit.doctor}</span></p>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">{visit.diagnosis}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
