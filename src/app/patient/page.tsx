"use client";
import { useEffect, useState } from 'react';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">My Dashboard</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Live Token Status</h3>
        <div className="flex items-center space-x-4">
          <span className="text-4xl font-bold text-blue-700">#42</span>
          <span className="text-lg text-slate-600">You are currently waiting for <strong>Dr. Smith</strong></span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h3>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Doctor</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Date & Time</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{apt.doctor}</td>
                <td className="px-6 py-4 text-slate-600">{apt.date} at {apt.time}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
