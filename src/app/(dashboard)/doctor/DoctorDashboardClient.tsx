"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Users2, CheckCircle2, AlertCircle, Stethoscope, RefreshCw } from "lucide-react";

import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRealtime } from "@/hooks/useRealtime";
import { LiveBadge } from "@/components/realtime/LiveBadge";
import { cn } from "@/lib/utils";

export function DoctorDashboardClient({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { isConnected, lastEvent } = useRealtime();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/appointments?doctorId=${doctorId}&date=today`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching doctor schedule:", err);
      toast.error("Failed to load today's schedule.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === "appointment.created") {
      toast.info("New appointment booked! Refreshing list...");
      fetchAppointments();
    }
  }, [lastEvent, fetchAppointments]);

  const handleAction = (id: string, actionName: string) => {
    toast.success(`Action "${actionName}" triggered for appointment ${id}`);
  };

  const total = loading ? "-" : appointments.length;
  const queue = loading ? "-" : appointments.filter(a => ["ARRIVED", "IN_PROGRESS", "SCHEDULED"].includes(a.rawStatus || "")).length;
  const completed = loading ? "-" : appointments.filter(a => ["COMPLETED", "PAID"].includes(a.rawStatus || "")).length;
  const avgWaitTime = loading ? "-" : "12 min";

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const firstName = doctorName.replace(/^(Dr\.\s*|Dr\s*)/i, "").split(" ")[0] || doctorName;

  const getStatusColor = (status: string) => {
    switch(status) {
      case "SCHEDULED": return "border-l-blue-400";
      case "ARRIVED": return "border-l-amber-400";
      case "IN_PROGRESS": return "border-l-orange-400";
      case "COMPLETED": case "PAID": return "border-l-emerald-400";
      case "CANCELLED": return "border-l-red-400";
      default: return "border-l-slate-400";
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case "SCHEDULED": return "bg-blue-400";
      case "ARRIVED": return "bg-amber-400";
      case "IN_PROGRESS": return "bg-orange-400";
      case "COMPLETED": case "PAID": return "bg-emerald-400";
      case "CANCELLED": return "bg-red-400";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader 
        title={`Good morning, Dr. ${firstName}`} 
        description={todayDate}
        action={<LiveBadge isConnected={isConnected} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Appointments" value={total} icon={Calendar} iconColor="text-primary-600" iconBgColor="bg-primary-50" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        <StatCard title="In Queue" value={queue} icon={Users2} iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        <StatCard title="Avg Consultation" value={avgWaitTime} icon={Clock} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Today's Schedule</h2>
          {!loading && !error && appointments.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {appointments.length} appointments
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAppointments} disabled={loading} className="text-slate-500 hover:text-slate-900">
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <EmptyState 
            icon={AlertCircle} 
            title="Failed to load schedule" 
            description="We couldn't retrieve your appointments. Please try again." 
            action={
              <Button onClick={fetchAppointments} variant="default" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            }
          />
        ) : appointments.length > 0 ? (
          appointments.map((appt) => (
            <div 
              key={appt.id} 
              className={cn(
                "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow gap-4 border-l-4",
                getStatusColor(appt.rawStatus || "SCHEDULED")
              )}
            >
              {/* Left: Time & Center: Info */}
              <div className="flex items-start md:items-center gap-4">
                <div className="flex items-center min-w-28 gap-2">
                  <div className={cn("h-2 w-2 rounded-full", getStatusDot(appt.rawStatus || "SCHEDULED"))}></div>
                  <span className="text-sm font-medium text-slate-700">{appt.time || "10:00 AM"}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">
                    {appt.patientName} 
                    <span className="font-normal text-slate-500 ml-2">({appt.patientAge || '25'}y)</span>
                  </span>
                  <span className="text-sm text-slate-500 mt-0.5">{appt.reason || "General Consultation"}</span>
                </div>
              </div>
              
              {/* Right: Badge & Action */}
              <div className="flex items-center gap-3">
                <StatusBadge status={appt.rawStatus || "SCHEDULED"} />
                
                {(appt.rawStatus === "ARRIVED" || appt.rawStatus === "IN_PROGRESS") && (
                  <Button size="sm" variant="default" onClick={() => handleAction(appt.id, "Start Consultation")}>
                    Start Consultation
                  </Button>
                )}
                
                {(appt.rawStatus === "COMPLETED" || appt.rawStatus === "PAID") && (
                  <Button size="sm" variant="ghost" onClick={() => handleAction(appt.id, "View Details")}>
                    View Details
                  </Button>
                )}
                
                {(appt.rawStatus === "SCHEDULED" || !appt.rawStatus) && (
                  <Button size="sm" variant="secondary" onClick={() => handleAction(appt.id, "Check In")}>
                    Check In
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            icon={Calendar} 
            title="No appointments today" 
            description="You have no scheduled appointments for today." 
          />
        )}
      </div>
    </div>
  );
}
