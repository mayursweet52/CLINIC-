"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, CheckCircle2 } from "lucide-react";

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Receptionist sees "Completed" by doctor to collect payment
          setAppointments(data.filter(a => a.rawStatus === "COMPLETED"));
        }
      })
      .catch(err => console.error("Error fetching appointments:", err))
      .finally(() => setLoading(false));
  }, []);

  const collectPayment = async (id: string) => {
    alert("Payment of ₹1500 Collected Successfully! Bill Generated.");
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 font-sans text-sm">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <Users className="h-6 w-6 text-zinc-500" />
            Front Desk & Billing
          </h1>
          <p className="text-zinc-500">Manage patient check-ins and collect payments for completed consultations.</p>
        </div>

        {/* Dashboard Cards (Static for now) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-zinc-500 font-medium">Pending Bills</p>
              <h2 className="text-3xl font-bold text-zinc-950">{loading ? "-" : appointments.length}</h2>
            </div>
            <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          {/* Add more stat cards as needed... */}
        </div>

        {/* Pending Bills List */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Awaiting Payment</h2>
          
          <div className="space-y-3">
            {loading ? (
              // Skeleton Loaders
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white p-5 rounded-xl border border-zinc-200 flex items-center justify-between shadow-sm">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-md" />
                </div>
              ))
            ) : appointments.length > 0 ? (
              appointments.map(appt => (
                <div key={appt.id} className="bg-white p-5 rounded-xl border border-zinc-200 flex flex-col md:flex-row justify-between md:items-center shadow-sm gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-zinc-950">{appt.patientName}</h3>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">Token #{appt.tokenNumber}</Badge>
                      <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Completed</Badge>
                    </div>
                    <p className="text-zinc-500 font-medium">Doctor: <span className="text-zinc-700">{appt.doctor}</span></p>
                  </div>
                  <Button 
                    onClick={() => collectPayment(appt.id)}
                    className="w-full md:w-auto shadow-sm"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Collect ₹1500
                  </Button>
                </div>
              ))
            ) : (
              // Empty State
              <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-950">Queue is clear</h3>
                <p className="text-zinc-500 mt-1 max-w-sm">There are no pending bills or patients awaiting payment right now.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

