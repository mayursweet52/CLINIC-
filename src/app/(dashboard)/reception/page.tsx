"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle, Calendar, Users2 } from "lucide-react";

import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ReceptionDashboard() {
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAllAppointments(data);
          // Receptionist sees "COMPLETED" appointments to collect payment
          setPendingBills(data.filter((a) => a.rawStatus === "COMPLETED"));
        }
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        toast.error("Failed to load appointments.");
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const collectPayment = async (id: string) => {
    toast.success("Payment of ₹1500 Collected Successfully! Bill Generated.");
    setPendingBills((prev) => prev.filter((a) => a.id !== id));
  };

  // Stats calculation
  const total = loading ? "-" : allAppointments.length;
  const queue = loading ? "-" : allAppointments.filter(a => ["ARRIVED", "IN_PROGRESS", "SCHEDULED"].includes(a.rawStatus || "")).length;
  const completed = loading ? "-" : allAppointments.filter(a => ["COMPLETED", "PAID"].includes(a.rawStatus || "")).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Front Desk & Billing" 
        description="Manage patient check-ins and collect payments for completed consultations." 
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Appointments" value={total} icon={Calendar} iconColor="text-blue-500" />
        <StatCard title="In Queue" value={queue} icon={Users2} iconColor="text-yellow-500" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} iconColor="text-green-500" />
        <StatCard title="Avg Wait Time" value={loading ? "-" : "14 min"} icon={Clock} iconColor="text-orange-500" />
      </div>

      {/* Wrapped List inside Card */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="text-lg font-semibold">Awaiting Payment</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col divide-y divide-border">
            {loading ? (
              <div className="p-0">
                {/* Changed cols to 1 because list format is currently 1 row per appointment */}
                <TableSkeleton rows={4} cols={1} />
              </div>
            ) : error ? (
              <div className="p-8">
                <EmptyState 
                  icon={AlertCircle} 
                  title="Failed to load" 
                  description="Please refresh the page to try again." 
                />
              </div>
            ) : pendingBills.length > 0 ? (
              pendingBills.map((appt) => (
                <div 
                  key={appt.id} 
                  className="flex flex-col md:flex-row justify-between md:items-center p-4 hover:bg-muted/5 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold">{appt.patientName}</h3>
                      <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                        Token #{appt.tokenNumber}
                      </span>
                      {/* Using StatusBadge Component */}
                      <StatusBadge status={appt.rawStatus || "COMPLETED"} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Doctor: <span className="font-medium text-foreground">{appt.doctor}</span>
                    </p>
                  </div>
                  {/* Using Outline Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => collectPayment(appt.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                    Collect ₹1500
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8">
                <EmptyState 
                  icon={Calendar} 
                  title="Queue is clear" 
                  description="Pending bills and completed consultations will appear here." 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
