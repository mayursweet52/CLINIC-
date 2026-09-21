"use client";
import { useState, useEffect } from "react";

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Receptionist sees "Completed" by doctor to collect payment
          setAppointments(data.filter(a => a.rawStatus === "COMPLETED"));
        }
      })
      .catch(err => console.error("Error fetching appointments:", err));
  }, []);

  const collectPayment = async (id: string) => {
    alert("Payment of ₹500 Collected Successfully! Bill Generated.");
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Front Desk & Billing</h1>
      <p className="text-slate-500 mb-8">Patients who have finished doctor consultation and need billing.</p>
      
      <div className="grid gap-4 max-w-4xl">
        {appointments.map(appt => (
          <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{appt.patientName}</h3>
              <p className="text-slate-500 text-sm">Token #{appt.tokenNumber} • Doctor: {appt.doctor}</p>
            </div>
            <button 
              onClick={() => collectPayment(appt.id)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all"
            >
              Collect ₹500 & Print Bill
            </button>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-slate-400">No pending bills.</p>
        )}
      </div>
    </div>
  );
}
