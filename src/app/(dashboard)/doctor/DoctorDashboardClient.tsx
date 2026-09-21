"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, Users2, CheckCircle2, AlertCircle, Stethoscope, RefreshCw } from "lucide-react";

import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";

export function DoctorDashboardClient({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Pass doctorId and date filters
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

  const handleAction = (id: string, actionName: string) => {
    toast.success(`Action "${actionName}" triggered for appointment ${id}`);
    // Real implementation would update DB and optimistic UI
  };

  // Stats calculation
  const total = loading ? "-" : appointments.length;
  const queue = loading ? "-" : appointments.filter(a => ["ARRIVED", "IN_PROGRESS", "SCHEDULED"].includes(a.rawStatus || "")).length;
  const completed = loading ? "-" : appointments.filter(a => ["COMPLETED", "PAID"].includes(a.rawStatus || "")).length;
  const avgWaitTime = loading ? "-" : "12 min"; // Dummy calculation

  // Date formatting for header
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title={`Good morning, Dr. ${doctorName.replace(/^(Dr\.\s*|Dr\s*)/i, "").split(" ")[0] || doctorName}`} 
        description={`Today is ${todayDate}. Here is your schedule for the day.`} 
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Appointments" value={total} icon={Calendar} iconColor="text-blue-500" />
        <StatCard title="In Queue" value={queue} icon={Users2} iconColor="text-yellow-500" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} iconColor="text-green-500" />
        <StatCard title="Avg Wait Time" value={avgWaitTime} icon={Clock} iconColor="text-orange-500" />
      </div>

      {/* Schedule List inside Card */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchAppointments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col divide-y divide-border">
            {loading ? (
              <div className="p-0">
                <TableSkeleton rows={5} cols={1} />
              </div>
            ) : error ? (
              <div className="p-8">
                <EmptyState 
                  icon={AlertCircle} 
                  title="Failed to load schedule" 
                  description="We couldn't retrieve your appointments. Please try again." 
                  action={
                    <Button onClick={fetchAppointments} variant="outline" className="mt-4">
                      <RefreshCw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                  }
                />
              </div>
            ) : appointments.length > 0 ? (
              appointments.map((appt) => (
                <div 
                  key={appt.id} 
                  className="flex flex-col md:flex-row justify-between md:items-center p-4 hover:bg-muted/5 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold">{appt.patientName} <span className="text-muted-foreground font-normal text-sm">({appt.patientAge || '25'}y)</span></h3>
                      <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full bg-muted/30">
                        Token #{appt.tokenNumber}
                      </span>
                      <StatusBadge status={appt.rawStatus || "SCHEDULED"} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {appt.time || "10:00 AM"}
                      </span>
                      <span className="flex items-center gap-1 border-l pl-4">
                        <Stethoscope className="h-3 w-3" /> {appt.reason || "General Consultation"}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleAction(appt.id, "Start Consultation")}
                  >
                    <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                    Start Consult
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8">
                <EmptyState 
                  icon={Calendar} 
                  title="No appointments today" 
                  description="You have no scheduled appointments for today." 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
