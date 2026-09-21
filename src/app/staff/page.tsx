"use client";
import { useState, useEffect } from "react";
import { Search, Bell, Menu, User, Activity, Clock, FileText, Pill, Save, Download, Lock, Radio, Volume2 } from "lucide-react";
import { useRealtime, playHospitalChime } from "@/hooks/useRealtime";

export default function DoctorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-Time Event Listener
  const { isConnected, emit } = useRealtime({
    enableChime: true,
    onEvent: (event) => {
      if (event.type === 'appointment.created' || event.type === 'patient.checked_in') {
        fetchAppointments();
        const pName = event.payload?.patientName || 'New Patient';
        const tNum = event.payload?.tokenNumber ? `#${event.payload.tokenNumber}` : '';
        setToastMessage(`⚡ Real-Time Alert: ${pName} (${tNum}) added to queue!`);
        setTimeout(() => setToastMessage(null), 6000);
      }
    }
  });

  const handleCallPatient = async (patient: any) => {
    if (!patient) return;
    playHospitalChime();
    const token = patient.tokenNumber;
    const name = patient.patient?.name || 'Patient';
    await emit('queue.next', {
      tokenNumber: token,
      patientName: name,
      doctorName: 'Dr. Smith',
      room: 'Consulting Room 1'
    });
    setToastMessage(`📢 Calling Token #${token} (${name}) on Waiting Room TV!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Vitals form cha state
  const [vitalsData, setVitalsData] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    pulseBpm: "",
    weightKg: "",
    temperature: "",
    symptoms: "",
    doctorNotes: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "dr.smith@clinic.com" && password === "doctor123") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid ID or Password. Try: dr.smith@clinic.com / doctor123");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      
      if (!Array.isArray(data)) return;

      const activeQueue = data.filter((a: any) => 
        a.rawStatus !== "COMPLETED" && 
        a.status !== "Completed" && 
        a.rawStatus !== "CANCELLED" && 
        a.status !== "Cancelled"
      );
      setAppointments(activeQueue);
      
      setSelectedPatient((prev: any) => {
        if (!prev && activeQueue.length > 0) return activeQueue[0];
        if (prev) {
          const stillExists = activeQueue.find((a: any) => a.id === prev.id);
          return stillExists || (activeQueue.length > 0 ? activeQueue[0] : null);
        }
        return null;
      });
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      const interval = setInterval(() => fetchAppointments(), 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedPatient.id,
          patientId: selectedPatient.patient?.id || selectedPatient.patientId,
          ...vitalsData
        }),
      });

      if (res.ok) {
        alert("Consultation successfully saved! Patient marked as Completed.");
        setVitalsData({ bpSystolic: "", bpDiastolic: "", pulseBpm: "", weightKg: "", temperature: "", symptoms: "", doctorNotes: "" });
        setSelectedPatient(null);
        await fetchAppointments(); 
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to save consultation.");
      }
    } catch (error) {
      console.error("Error saving vitals:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "N/A";
    const diff = Date.now() - new Date(dobString).getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age > 0 ? `${age} yrs` : "Infant";
  };

  const exportToExcel = () => {
    if (appointments.length === 0) {
      alert("No patients to export.");
      return;
    }

    const headers = ["Token Number", "Patient Name", "Patient Code", "Age", "Gender", "Phone", "Time", "Status", "Blood Group"];
    const csvContent = [
      headers.join(","),
      ...appointments.map((a: any) => {
        const p = a.patient || {};
        return [
          a.tokenNumber,
          `"${p.name || "N/A"}"`,
          p.patientCode || "N/A",
          calculateAge(p.dob),
          p.gender || "N/A",
          p.phone || "N/A",
          a.time,
          a.status,
          p.bloodGroup || "N/A"
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `patients_queue_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2">Staff Login</h2>
          <p className="text-slate-500 text-center mb-8">Please enter your credentials to access the Doctor Dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email / ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dr.smith@clinic.com"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2">
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans text-slate-800 animate-in fade-in duration-500">
      <aside className="w-20 lg:w-64 bg-slate-900 flex flex-col items-center lg:items-start text-white transition-all duration-300 z-20">
        <div className="h-20 w-full flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <span className="hidden lg:block ml-3 text-xl font-black tracking-tight">Clinic<span className="text-indigo-400">OS</span></span>
        </div>
        <nav className="flex-1 w-full py-6 flex flex-col gap-2 px-3">
          <button className="w-full flex items-center gap-3 bg-indigo-600/10 text-indigo-400 px-4 py-3 rounded-xl transition-all border border-indigo-500/20">
            <User className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Consultation</span>
          </button>
        </nav>
        <div className="p-4 w-full">
          <button onClick={() => setIsAuthenticated(false)} className="w-full text-center py-2 text-sm text-slate-400 hover:text-white transition-colors">
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-800">Live Queue Monitor</h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isConnected ? 'Real-Time Connected' : 'Syncing...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-200 transition-colors"
              title="Download Queue List"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel (CSV)</span>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search patient..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 transition-all" />
            </div>
          </div>
        </header>

        {toastMessage && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 text-sm font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 flex flex-col h-[40vh] lg:h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-500" /> Waiting List ({appointments.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {appointments.map((appt) => {
                const isActive = selectedPatient?.id === appt.id;
                return (
                  <button key={appt.id} onClick={() => setSelectedPatient(appt)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isActive ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-white text-xs font-black px-2 py-0.5 rounded uppercase">#{appt.tokenNumber}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          appt.status === "Arrived" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        }`}>{appt.status}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{appt.time}</span>
                    </div>
                    <h4 className={`text-lg font-bold ${isActive ? "text-indigo-900" : "text-slate-900"}`}>
                      {appt.patient?.name || "Unknown"}
                    </h4>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex gap-3">
                      <span>Age: {calculateAge(appt.patient?.dob)}</span>
                      <span>Gender: {appt.patient?.gender || "N/A"}</span>
                    </p>
                  </button>
                )
              })}
              {appointments.length === 0 && (
                <div className="text-center p-8 text-slate-400 font-medium text-sm">
                  No patients in the waiting queue.
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {!selectedPatient ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                <Activity className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-500 mb-2">Ready for Consultation</h3>
                <p className="text-sm">Select a patient from the queue to start.</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-slate-900">
                          {selectedPatient.patientName || selectedPatient.patient?.name || "Unknown Patient"}
                        </h1>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                          In Session
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCallPatient(selectedPatient)}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                        title="Announce patient on Waiting Room TV screen"
                      >
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        <span>📢 Call Token #{selectedPatient.tokenNumber} on TV</span>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Token</span>
                        <span className="text-sm font-bold text-slate-800">#{selectedPatient.tokenNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Age</span>
                        <span className="text-sm font-bold text-slate-800">{calculateAge(selectedPatient.patient?.dob)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Gender</span>
                        <span className="text-sm font-bold text-slate-800">{selectedPatient.patient?.gender || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Blood Group</span>
                        <span className="text-sm font-bold text-red-600">{selectedPatient.patient?.bloodGroup || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Allergies</span>
                        <span className="text-sm font-bold text-amber-600">
                          {selectedPatient.patient?.allergies?.length > 0 ? selectedPatient.patient.allergies.join(", ") : "None"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Chronic Cond.</span>
                        <span className="text-sm font-bold text-indigo-600">
                          {selectedPatient.patient?.chronicConds?.length > 0 ? selectedPatient.patient.chronicConds.join(", ") : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveConsultation} className="space-y-8 max-w-4xl">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Patient Vitals
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Blood Pressure</label>
                        <div className="flex items-center gap-1">
                          <input type="number" required placeholder="120" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center font-bold outline-none" 
                            value={vitalsData.bpSystolic} onChange={(e) => setVitalsData({...vitalsData, bpSystolic: e.target.value})} />
                          <span className="text-slate-400 font-light">/</span>
                          <input type="number" required placeholder="80" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center font-bold outline-none" 
                            value={vitalsData.bpDiastolic} onChange={(e) => setVitalsData({...vitalsData, bpDiastolic: e.target.value})} />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Heart Rate</label>
                        <div className="flex items-center gap-2">
                          <input type="number" required placeholder="72" className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold outline-none" 
                            value={vitalsData.pulseBpm} onChange={(e) => setVitalsData({...vitalsData, pulseBpm: e.target.value})} />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Weight (Kg)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" step="0.1" required placeholder="65.5" className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold outline-none" 
                            value={vitalsData.weightKg} onChange={(e) => setVitalsData({...vitalsData, weightKg: e.target.value})} />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Temp (°F)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" step="0.1" required placeholder="98.6" className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold outline-none" 
                            value={vitalsData.temperature} onChange={(e) => setVitalsData({...vitalsData, temperature: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Diagnosis & Notes
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Symptoms</label>
                        <input type="text" placeholder="e.g. Fever, Headache for 2 days..." className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none" 
                          value={vitalsData.symptoms} onChange={(e) => setVitalsData({...vitalsData, symptoms: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Clinical Notes & Treatment Plan</label>
                        <textarea rows={4} placeholder="Detailed diagnosis..." className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none resize-none" 
                          value={vitalsData.doctorNotes} onChange={(e) => setVitalsData({...vitalsData, doctorNotes: e.target.value})}></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                      <Save className="w-5 h-5 inline-block mr-2" />
                      {loading ? "Saving Record..." : "Complete Consultation"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

