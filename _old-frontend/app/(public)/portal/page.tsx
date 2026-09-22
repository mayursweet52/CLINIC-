"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Bell, User, Calendar, Pill, Receipt, FileText, 
  MapPin, X, ChevronRight, Home, Download
} from "lucide-react";

export default function PortalDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/me")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setData)
      .catch(() => {
        router.push("/portal/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const upcomingAppts = data.appointments?.filter((a: any) => ["SCHEDULED", "CONFIRMED"].includes(a.status)) || [];
  const nextAppt = upcomingAppts.length > 0 ? upcomingAppts[0] : null;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
            {data.patient?.name?.charAt(0) || "P"}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Good Morning</p>
            <h1 className="text-base font-bold">Hi, {data.patient?.name?.split(' ')[0] || "Patient"}</h1>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 relative bg-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
      </header>

      <main className="px-4 pt-6 space-y-6">
        {/* 4 small cards grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{upcomingAppts.length}</p>
            <p className="text-xs font-medium text-slate-500">Upcoming<br/>Appointments</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Pill className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs font-medium text-slate-500">Active<br/>Prescriptions</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{data.bills?.filter((b: any) => b.status === "PENDING").length || 0}</p>
            <p className="text-xs font-medium text-slate-500">Pending<br/>Bills</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs font-medium text-slate-500">Medical<br/>Reports</p>
          </div>
        </div>

        {/* Upcoming Appointment Section */}
        {nextAppt && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-3 px-1">Next Appointment</h2>
            <div className="bg-primary-600 text-white p-5 rounded-3xl shadow-lg shadow-primary-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start relative z-10 mb-6">
                <div>
                  <h3 className="font-bold text-lg">Dr. {nextAppt.doctor}</h3>
                  <p className="text-primary-100 text-sm">General Physician</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-primary-200 uppercase font-bold tracking-wider mb-1">Token Number</p>
                  <p className="text-3xl font-mono font-bold leading-none">{nextAppt.token}</p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm relative z-10 flex items-center gap-4">
                <div className="bg-white/20 rounded-xl p-3 flex flex-col items-center justify-center min-w-[60px]">
                  <span className="text-xs font-bold uppercase">{new Date(nextAppt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(nextAppt.date).getDate()}</span>
                </div>
                <div>
                  <p className="font-bold">{nextAppt.time || "10:30 AM"}</p>
                  <p className="text-xs text-primary-100">Estimated consultation time</p>
                </div>
              </div>
              
              <div className="flex gap-3 relative z-10">
                <button className="flex-1 bg-white text-primary-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                  <MapPin className="w-4 h-4" /> Get Directions
                </button>
                <button className="w-12 flex-shrink-0 border border-white/20 py-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Recent Prescriptions */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-900">Recent Prescriptions</h2>
            <button className="text-xs font-bold text-primary-600">See All</button>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Dr. Smith</h4>
                    <p className="text-xs text-slate-500 mt-0.5">14 Sep 2026 • 2 Medicines</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bills */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-900">Recent Bills</h2>
            <button className="text-xs font-bold text-primary-600">See All</button>
          </div>
          <div className="space-y-3">
            {data.bills?.slice(0, 3).map((bill: any) => (
              <div key={bill.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg tracking-tight">₹{bill.amount}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(bill.date).toLocaleDateString()}</p>
                </div>
                <div>
                  {bill.status === 'PENDING' ? (
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                      Pay Now
                    </button>
                  ) : (
                    <button className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50">
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!data.bills || data.bills.length === 0) && (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                No recent bills
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-20">
        <div className="flex justify-around items-center h-16">
          <button className="flex flex-col items-center gap-1 text-primary-600">
            <Home className="w-5 h-5 fill-primary-600" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Book</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Records</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
