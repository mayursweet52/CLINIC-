'use client';
import { useState, useEffect } from 'react';
import { Appointment } from '@/types';

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
    await fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 pb-6 border-b border-slate-200">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Front Desk</h2>
        <p className="text-slate-500">Manage waiting room queues and patient flow.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="p-0 relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="p-6">Patient Name</th>
                <th className="p-6">Doctor</th>
                <th className="p-6">Time</th>
                <th className="p-6 text-right">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map(app => (
                <tr key={app.id} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="p-6 font-bold text-slate-900 text-lg">{app.patientName}</td>
                  <td className="p-6 text-slate-600 font-medium">{app.doctor}</td>
                  <td className="p-6 text-slate-600 font-medium">{app.time}</td>
                  <td className="p-6 text-right">
                    <select 
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 outline-none cursor-pointer transition-all shadow-sm focus:ring-4
                        ${app.status === 'Arrived' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-100' : 
                          app.status === 'In Consultation' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-100' : 
                          app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-100' : 
                          'bg-slate-50 text-slate-700 border-slate-200 focus:ring-slate-100'}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Arrived">Arrived</option>
                      <option value="In Consultation">In Consultation</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">
                    The waiting room is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
