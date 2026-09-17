"use client";
import { useEffect, useState } from 'react';

export default function StaffDashboard() {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Doctor Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-500">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">Total Patients</h3>
          <p className="text-3xl font-bold text-slate-800">24</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-green-500">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">Completed</h3>
          <p className="text-3xl font-bold text-slate-800">18</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-yellow-500">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">Waiting Room</h3>
          <p className="text-3xl font-bold text-slate-800">6</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Patient Queue</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {patients.map(p => (
            <li key={p.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800 text-lg">{p.name} <span className="text-slate-500 font-normal text-sm ml-2">({p.age} yrs)</span></p>
                <p className="text-sm text-slate-600 mt-1"><strong className="font-medium text-slate-700">History:</strong> {p.history}</p>
              </div>
              <button className="text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                View EMR
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
