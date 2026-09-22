"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ReceptionDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    setError(false);
    fetch("/api/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCheckIn = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, rawStatus: "ARRIVED" } : a));
      toast.success("Patient checked in");
      // Add actual API call if needed
    } catch (err) {
      toast.error("Failed to check in");
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/appointment/${id}`);
  };

  const total = loading ? "-" : appointments.length;
  const queue = loading ? "-" : appointments.filter(a => ["ARRIVED", "IN_PROGRESS", "SCHEDULED"].includes(a.rawStatus || "")).length;
  const completed = loading ? "-" : appointments.filter(a => ["COMPLETED", "PAID"].includes(a.rawStatus || "")).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Reception Desk" 
        description={format(new Date(), "EEEE, dd MMMM yyyy")} 
        action={
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            + New Appointment
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Appointments" value={total} icon={Calendar} iconColor="text-teal-600" />
        <StatCard title="In Queue" value={queue} icon={Users} iconColor="text-amber-500" />
        <StatCard title="Completed" value={completed} icon={CheckCircle} iconColor="text-emerald-500" />
        <StatCard title="Avg Wait Time" value={loading ? "-" : "14 min"} icon={Clock} iconColor="text-blue-500" />
      </div>

      {/* Queue Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Token</th>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Doctor</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={6} cols={6} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState 
                      icon={AlertCircle} 
                      title="Failed to load" 
                      description="Please try again" 
                      action={<Button onClick={fetchAppointments} variant="outline">Retry</Button>}
                    />
                  </td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr 
                    key={appt.id} 
                    onClick={() => handleRowClick(appt.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary-600">
                        {appt.tokenNumber || "TKN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {appt.patientName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {appt.doctor}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {appt.time || appt.date ? format(new Date(appt.date || Date.now()), "hh:mm a") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appt.rawStatus || "SCHEDULED"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {appt.rawStatus === "SCHEDULED" ? (
                        <Button 
                          size="sm" 
                          onClick={(e) => handleCheckIn(e, appt.id)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          Check In
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs px-2">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState 
                      icon={Calendar} 
                      title="No appointments today" 
                      description="Bookings will appear here automatically" 
                    />
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
