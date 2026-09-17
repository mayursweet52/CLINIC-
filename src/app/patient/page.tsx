'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Health</h2>
          <p className="text-slate-500">Track your appointments and medical records.</p>
        </div>
        <Link 
          href="/patient/book"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-95"
        >
          + Book Consultation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Live Token Status */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Live Clinic Token</h3>
          <p className="text-7xl font-black text-amber-500 tracking-tighter mb-4 relative z-10">#42</p>
          <p className="text-slate-600 font-medium relative z-10">Dr. Smith is currently seeing token #40.</p>
          <span className="mt-6 px-4 py-2 bg-amber-50 text-amber-700 font-bold text-sm rounded-full border border-amber-200 relative z-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Estimated wait: 15 mins
          </span>
        </div>

        {/* Appointment History */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-[#fafafa]">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Appointments</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-slate-400 font-medium">Loading records...</p>
            ) : appointments.length > 0 ? (
              <ul className="space-y-4">
                {appointments.map(app => (
                  <li key={app.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{app.doctor}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold 
                        ${app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Date: {app.date} • Time: {app.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="font-medium">No past appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
