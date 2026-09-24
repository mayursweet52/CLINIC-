"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, Calendar, Pill, User, Bell, LogOut, Clock, MapPin,
  FileText, CreditCard, Download, CalendarPlus, Building2,
  ChevronRight, Activity, Navigation, AlertCircle, RefreshCw,
  FlaskConical, CheckCircle2, X
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function PatientDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/portal/me");
      if (res.status === 401) {
        router.push("/portal/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load dashboard");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // 30s Polling fallback
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/portal/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setCanceling(true);
    try {
      const res = await fetch(`/api/appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentId, status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error("Failed to cancel appointment");
      toast.success("Appointment cancelled");
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setCanceling(false);
    }
  };

  // Loading Skeletons
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-surface pb-24">
        <header className="sticky top-0 z-40 bg-surface-lowest/95 backdrop-blur-md border-b border-outline-variant/20 h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-surface-variant/40" />
            <div className="space-y-1">
              <div className="w-24 h-3 bg-surface-variant/40 rounded" />
              <div className="w-16 h-2 bg-surface-variant/30 rounded" />
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-lowest rounded-2xl p-4 h-24 animate-pulse border border-outline-variant/10" />
            ))}
          </div>
          <div className="h-44 bg-surface-lowest rounded-3xl animate-pulse border border-outline-variant/10" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-surface-lowest rounded-2xl animate-pulse" />
            <div className="h-20 bg-surface-lowest rounded-2xl animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-surface-lowest rounded-3xl p-8 max-w-sm w-full text-center border border-outline-variant/20 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-error mx-auto" />
          <h2 className="text-xl font-bold text-on-surface">Unable to load dashboard</h2>
          <p className="text-sm text-on-surface-variant">{error}</p>
          <Button onClick={fetchDashboard} className="w-full h-11 rounded-full gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate Data Lists
  const appointments = data?.appointments || [];
  const upcomingAppointment = appointments.find(
    (a: any) => ["CONFIRMED", "ARRIVED", "IN_CONSULTATION", "PENDING"].includes(a.status)
  );
  
  const prescriptions = data?.prescriptions || [];
  const bills = data?.bills || [];
  const labReports = data?.labReports || [];
  const firstName = data?.name ? data.name.split(" ")[0] : "Patient";
  const initials = data?.name 
    ? data.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "PT";

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans text-on-surface">
      
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-surface-lowest/95 backdrop-blur-md border-b border-outline-variant/20 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shadow-inner">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-on-surface">Hi, {firstName}</span>
            </div>
            <p className="text-[11px] font-mono font-medium text-on-surface-variant tracking-wider uppercase">
              {data?.patientCode || "PT-89201"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            type="button" 
            className="p-2.5 rounded-full text-on-surface-variant hover:bg-surface-low transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-surface-lowest" />
          </button>
          <button 
            type="button" 
            onClick={handleLogout}
            className="p-2.5 rounded-full text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        
        {/* Section A — 4 Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          {/* Stat 1: Upcoming Appointments */}
          <div className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-on-surface-variant mb-1">Upcoming</p>
              <h3 className="text-2xl font-bold text-on-surface">
                {appointments.filter((a: any) => ["CONFIRMED", "ARRIVED", "PENDING"].includes(a.status)).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2: Prescriptions */}
          <div className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-on-surface-variant mb-1">Prescriptions</p>
              <h3 className="text-2xl font-bold text-on-surface">{prescriptions.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3: Bills */}
          <div className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-on-surface-variant mb-1">Bills</p>
              <h3 className="text-2xl font-bold text-on-surface">{bills.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 4: Lab Reports */}
          <div className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-on-surface-variant mb-1">Lab Reports</p>
              <h3 className="text-2xl font-bold text-on-surface">{labReports.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Section B — HERO: Next Appointment */}
        <section>
          {upcomingAppointment ? (
            <div className="bg-gradient-to-br from-primary to-primary-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              {/* Token Display Top Right */}
              <div className="flex items-start justify-between mb-4">
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Next Appointment
                </span>
                <span className="font-mono font-bold text-2xl bg-white/20 text-white px-3 py-1 rounded-2xl backdrop-blur-md">
                  {upcomingAppointment.tokenDisplay || `#${upcomingAppointment.tokenNumber || "14"}`}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-white/20 text-white font-bold text-lg flex items-center justify-center backdrop-blur-md shrink-0">
                  {upcomingAppointment.doctor?.name ? upcomingAppointment.doctor.name[0] : "D"}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {upcomingAppointment.doctor?.name || "Dr. Assigned"}
                  </h3>
                  <p className="text-xs text-primary-100 font-medium mt-0.5">
                    {upcomingAppointment.doctor?.specialization || upcomingAppointment.doctor?.doctorProfile?.specialization || "General Physician"}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white/10 rounded-2xl p-3.5 flex items-center justify-around mb-5 backdrop-blur-sm text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-200" />
                  <span className="font-medium">
                    {new Date(upcomingAppointment.appointmentDate).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short"
                    })}
                  </span>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-200" />
                  <span className="font-medium">{upcomingAppointment.timeSlot}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  asChild 
                  className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl h-11 shadow-sm text-xs"
                >
                  <Link href={`/t/${upcomingAppointment.publicToken || upcomingAppointment.id}`}>
                    <Navigation className="w-4 h-4 mr-1.5" /> Directions
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCancelAppointment(upcomingAppointment.id)}
                  disabled={canceling}
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white rounded-xl h-11 text-xs"
                >
                  <X className="w-4 h-4 mr-1.5" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-lowest rounded-3xl p-6 border border-outline-variant/20 text-center shadow-sm">
              <EmptyState 
                icon={Calendar} 
                title="No upcoming appointments" 
                description="Book a consultation with top specialists at our clinics."
                action={
                  <Button asChild className="rounded-full px-6 h-11 font-bold shadow-sm">
                    <Link href="/book">
                      <CalendarPlus className="w-4 h-4 mr-2" /> Book Appointment Now
                    </Link>
                  </Button>
                }
              />
            </div>
          )}
        </section>

        {/* Section C — Quick Actions */}
        <section className="grid grid-cols-2 gap-3">
          <Link 
            href="/book" 
            className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5 hover:border-primary/50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight text-on-surface">Book Consult</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Find slots</p>
            </div>
          </Link>

          <Link 
            href="/hospitals" 
            className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5 hover:border-primary/50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight text-on-surface">Find Clinic</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Explore locations</p>
            </div>
          </Link>
        </section>

        {/* Section D — Recent Prescriptions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-on-surface">Recent Prescriptions</h3>
            <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">
              View All
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/20 text-center">
              <p className="text-sm text-on-surface-variant">No recent prescriptions found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.slice(0, 3).map((rx: any) => {
                const medicinesCount = typeof rx.medicines === "string" 
                  ? JSON.parse(rx.medicines || "[]").length 
                  : (Array.isArray(rx.medicines) ? rx.medicines.length : 0);

                return (
                  <div key={rx.id} className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">
                          {rx.diagnosis || rx.visit?.diagnosis || "General Medical Checkup"}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {rx.doctor?.name || "Dr. Consulting"} • {new Date(rx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={rx.status || "DISPENSED"} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                      <span className="text-xs font-medium text-on-surface-variant">
                        {medicinesCount} medicine{medicinesCount !== 1 ? "s" : ""} prescribed
                      </span>
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 rounded-lg">
                        <a href={`/api/prescriptions/${rx.id}/pdf`} download>
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section E — Recent Bills */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-on-surface">Recent Bills</h3>
            <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">
              View All
            </span>
          </div>

          {bills.length === 0 ? (
            <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/20 text-center">
              <p className="text-sm text-on-surface-variant">No bill records available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills.slice(0, 3).map((bill: any) => (
                <div key={bill.id} className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-on-surface-variant">
                        #{bill.invoiceNo || bill.invoiceNumber || "INV-042"}
                      </span>
                      <StatusBadge status={bill.paymentStatus || "PENDING"} />
                    </div>
                    <p className="text-xl font-bold text-on-surface">
                      ₹{bill.totalAmount}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    {bill.paymentStatus === "PAID" ? (
                      <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5 rounded-lg border-success/30 text-success hover:bg-success/10">
                        <a href={`/api/public/bills/${bill.publicToken}/pdf`} download>
                          <Download className="w-3.5 h-3.5" /> Download Receipt
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" asChild className="h-9 text-xs font-bold gap-1.5 rounded-lg bg-primary hover:bg-primary-600 text-white shadow-sm">
                        <Link href={`/pay/${bill.publicToken}`}>
                          <CreditCard className="w-3.5 h-3.5" /> Pay Now
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section F — Recent Lab Reports */}
        {labReports.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-base text-on-surface">Lab Reports</h3>
            </div>
            <div className="space-y-3">
              {labReports.map((report: any) => (
                <div key={report.id} className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{report.testName || "Blood Test"}</h4>
                      <p className="text-xs text-on-surface-variant">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1 rounded-lg">
                    <a href={report.reportUrl || "#"} target="_blank" rel="noreferrer">
                      <Download className="w-3 h-3" /> View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* 3. BOTTOM NAVIGATION (Mobile-only, fixed) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface-lowest/95 backdrop-blur-md border-t border-outline-variant/20 md:hidden">
        <div className="max-w-lg mx-auto grid grid-cols-4 h-16">
          <Link 
            href="/portal" 
            className="flex flex-col items-center justify-center gap-1 text-primary font-bold transition-colors"
          >
            <div className="px-4 py-1 rounded-full bg-primary/10">
              <Home className="w-5 h-5 fill-primary" />
            </div>
            <span className="text-[10px]">Home</span>
          </Link>

          <Link 
            href="/portal#visits" 
            className="flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Visits</span>
          </Link>

          <Link 
            href="/portal#rx" 
            className="flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Pill className="w-5 h-5" />
            <span className="text-[10px]">Rx</span>
          </Link>

          <Link 
            href="/portal#profile" 
            className="flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
