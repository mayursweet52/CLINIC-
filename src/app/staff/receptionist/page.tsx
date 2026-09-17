"use client";

import { useState, useEffect } from 'react';

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  const updateStatus = (id: number, newStatus: string) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Waiting Room Queue</h2>
        <p className="text-slate-500 mt-2">Manage incoming patients and live token status.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Patient Name</th>
                <th className="p-4 font-semibold">Doctor</th>
                <th className="p-4 font-semibold">Time</th>
                <th className="p-4 font-semibold">Live Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-800">{app.patientName}</td>
                  <td className="p-4 text-slate-600">{app.doctor}</td>
                  <td className="p-4 font-medium">{app.time}</td>
                  <td className="p-4">
                    <select 
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 outline-none cursor-pointer transition-colors
                        ${app.status === 'Arrived' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                          app.status === 'In Consultation' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                          app.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                          'bg-slate-100 text-slate-700 border-slate-200'}`}
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
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No appointments in queue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Walk-in Management</h3>
            <p className="text-slate-500 text-sm">Register a new patient arriving without a prior appointment.</p>
          </div>
          <button className="whitespace-nowrap text-sm font-semibold bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            + Register Walk-in
          </button>
        </div>
      </div>
    </div>
  );
}
