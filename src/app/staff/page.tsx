'use client';

import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        if (data.length > 0) setSelectedPatient(data[0]);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h2>
        <p className="text-slate-500 mt-2">Manage your patients, view vitals, and update OPD history.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Patient Queue */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Today's Queue</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedPatient?.id === p.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">Age: {p.age} | Record #{p.id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Vitals & History Module */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
          {selectedPatient ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h3>
                  <p className="text-slate-500">Contact: {selectedPatient.contact}</p>
                </div>
                <span className="bg-green-100 text-green-700 font-bold px-4 py-1.5 rounded-full text-sm">
                  Active Session
                </span>
              </div>

              {/* Vitals Section */}
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Patient Vitals</h4>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Blood Pressure</p>
                  <input type="text" defaultValue="120/80" className="w-full bg-transparent font-bold text-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 rounded" />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Pulse (BPM)</p>
                  <input type="text" defaultValue="72" className="w-full bg-transparent font-bold text-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 rounded" />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Weight (kg)</p>
                  <input type="text" defaultValue="68" className="w-full bg-transparent font-bold text-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 rounded" />
                </div>
              </div>

              {/* OPD History Section */}
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">OPD Medical History</h4>
              <textarea 
                className="w-full flex-1 p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-indigo-400 focus:bg-white transition-colors resize-none"
                defaultValue={selectedPatient.history}
                placeholder="Write medical notes, diagnosis, and prescription here..."
              ></textarea>
              
              <div className="flex justify-end mt-4 gap-4">
                <button className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save Consultation</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a patient from the queue to view vitals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
