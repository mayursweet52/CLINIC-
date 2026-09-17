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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 pb-6 border-b border-slate-200">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Doctor Console</h2>
        <p className="text-slate-500">Manage patient sessions, log vitals, and update EMR history.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Queue */}
        <div className="w-full lg:w-1/3 flex flex-col h-[700px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-semibold text-slate-800 tracking-tight text-lg">Active Queue</h3>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{patients.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-hide">
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 group ${
                  selectedPatient?.id === p.id 
                    ? 'bg-white border-indigo-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-indigo-50/50' 
                    : 'bg-white/50 border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-slate-900 text-lg">{p.name}</p>
                  <span className={`w-2 h-2 rounded-full mt-2 ${selectedPatient?.id === p.id ? 'bg-indigo-500' : 'bg-slate-300 group-hover:bg-slate-400'}`}></span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Age: {p.age} • Record #{p.id.toString().padStart(4, '0')}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: EMR Module */}
        <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col h-[700px] relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

          {selectedPatient ? (
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start pb-6 mb-8 border-b border-slate-100">
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{selectedPatient.name}</h3>
                  <div className="flex gap-3 text-sm font-medium text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">{selectedPatient.contact}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md">ID: {selectedPatient.id}</span>
                  </div>
                </div>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  In Session
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Patient Vitals</h4>
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-5 bg-[#fafafa] rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                  <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">Blood Pressure</p>
                  <input type="text" defaultValue="120/80" className="w-full bg-transparent font-extrabold text-2xl text-slate-900 outline-none group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="p-5 bg-[#fafafa] rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                  <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">Pulse (BPM)</p>
                  <input type="text" defaultValue="72" className="w-full bg-transparent font-extrabold text-2xl text-slate-900 outline-none group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="p-5 bg-[#fafafa] rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                  <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">Weight (kg)</p>
                  <input type="text" defaultValue="68" className="w-full bg-transparent font-extrabold text-2xl text-slate-900 outline-none group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clinical Notes</h4>
              <textarea 
                className="w-full p-5 border border-slate-200 rounded-2xl bg-[#fafafa] outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all resize-none text-slate-700 leading-relaxed mb-8 h-32"
                defaultValue={selectedPatient.history}
                placeholder="Write medical notes and diagnosis here..."
              ></textarea>

              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Prescription (e-Rx)</h4>
                <button className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">+ Add Medicine</button>
              </div>
              <div className="bg-[#fafafa] border border-slate-200 rounded-2xl p-4 mb-6">
                <div className="flex gap-4 mb-3">
                  <input type="text" placeholder="Medicine Name (e.g. Paracetamol)" className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400" />
                  <select className="p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 font-medium">
                    <option>1-0-1 (Morning & Night)</option>
                    <option>1-1-1 (Three times a day)</option>
                    <option>0-0-1 (Night only)</option>
                    <option>SOS (As needed)</option>
                  </select>
                  <input type="number" placeholder="Days" className="w-24 p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400" />
                </div>
                <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Amoxicillin 500mg</p>
                    <p className="text-xs text-slate-500 font-medium">1-1-1 for 5 Days</p>
                  </div>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end mt-auto pt-6 gap-3 border-t border-slate-100">
                <button className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Discard</button>
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95">
                  Save & Complete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <p className="font-medium">Select a patient from the queue to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
