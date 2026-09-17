"use client";
import { useState, useEffect } from "react";
import { Search, Bell, Menu, User, Activity, Clock, FileText, Pill, Save, Plus, Trash2 } from "lucide-react";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Medicines Inventory from Database
  const [medicinesList, setMedicinesList] = useState<any[]>([]);

  // Vitals form cha state
  const [vitalsData, setVitalsData] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    pulseBpm: "",
    weightKg: "",
    symptoms: "",
    doctorNotes: ""
  });

  // e-Prescription state
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [currentMed, setCurrentMed] = useState({
    medicineId: "",
    dosage: "",
    durationDays: "",
    instructions: ""
  });

  // Fetch active queue and medicines
  const fetchData = async () => {
    try {
      // 1. Fetch Queue
      const res = await fetch("/api/appointments");
      const data = await res.json();
      
      if (Array.isArray(data)) {
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
      }

      // 2. Fetch Medicines from Pharmacy
      const medRes = await fetch("/api/pharmacy");
      if (medRes.ok) {
        const medData = await medRes.json();
        setMedicinesList(medData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Add medicine to prescription list
  const addMedicine = () => {
    if (!currentMed.medicineId || !currentMed.dosage || !currentMed.durationDays) {
      alert("Please fill all medicine details!");
      return;
    }
    const selectedMedData = medicinesList.find(m => m.id === currentMed.medicineId);
    
    setPrescriptions([...prescriptions, { 
      ...currentMed, 
      medicineName: selectedMedData?.name || "Unknown Medicine" 
    }]);
    
    // Form clear kara
    setCurrentMed({ medicineId: "", dosage: "", durationDays: "", instructions: "" });
  };

  // Remove medicine from list
  const removeMedicine = (index: number) => {
    const newList = [...prescriptions];
    newList.splice(index, 1);
    setPrescriptions(newList);
  };

  // Form submit kelyavar vitals aani prescriptions save kara
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
          ...vitalsData,
          prescriptions: prescriptions // Dawai chi list API la pathwa
        }),
      });

      if (res.ok) {
        alert("Consultation and Prescription successfully saved!");
        setVitalsData({ bpSystolic: "", bpDiastolic: "", pulseBpm: "", weightKg: "", symptoms: "", doctorNotes: "" });
        setPrescriptions([]); // Clear prescriptions
        setSelectedPatient(null);
        await fetchData(); 
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to save consultation.");
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (appt: any) => {
    setSelectedPatient(appt);
    setVitalsData({
      bpSystolic: appt.vitals?.bpSystolic ? String(appt.vitals.bpSystolic) : "",
      bpDiastolic: appt.vitals?.bpDiastolic ? String(appt.vitals.bpDiastolic) : "",
      pulseBpm: appt.vitals?.pulseBpm ? String(appt.vitals.pulseBpm) : "",
      weightKg: appt.vitals?.weightKg ? String(appt.vitals.weightKg) : "",
      symptoms: appt.vitals?.symptoms || "",
      doctorNotes: appt.vitals?.doctorNotes || ""
    });
    setPrescriptions([]); // Navin patient select kelyavar juni prescription clear kara
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[680px] bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">D</div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">Dr. Smith</h2>
            <p className="text-xs text-slate-500 font-medium">Cardiology Dept</p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</p>
          <div className="space-y-1">
            <a href="#" className="flex items-center gap-3 bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-xl font-semibold transition-colors">
              <Activity className="w-5 h-5" /> Today's Queue
            </a>
            <a href="/staff/receptionist" className="flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-colors">
              <User className="w-5 h-5" /> Reception Desk
            </a>
            <a href="/staff/pharmacy" className="flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-colors">
              <Pill className="w-5 h-5" /> Pharmacy Stock
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search patient name, ID..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              S
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 flex gap-6 overflow-hidden">
          
          {/* PATIENT QUEUE (LEFT SIDE) */}
          <div className="w-[320px] flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Live Queue
              </h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {appointments.length} Left
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {appointments.length === 0 ? (
                <div className="text-center p-8 text-slate-400">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No patients waiting</p>
                </div>
              ) : (
                appointments.map((appt) => {
                  const isSelected = selectedPatient?.id === appt.id;
                  return (
                    <div 
                      key={appt.id}
                      onClick={() => handlePatientSelect(appt)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold text-lg ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                          #{appt.tokenNumber || appt.token || 'N/A'}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                          {appt.status}
                        </span>
                      </div>
                      <h3 className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {appt.patientName || appt.patient?.name || 'Unknown Patient'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appt.time || appt.timeSlot || 'Walk-in'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* DOCTOR CONSULTATION FORM (RIGHT SIDE) */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto relative">
            
            {!selectedPatient ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-500 mb-2">Ready for Consultation</h3>
                <p className="text-sm">Select a patient from the queue to start.</p>
              </div>
            ) : (
              <div className="p-8">
                
                {/* Patient Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-extrabold text-slate-900">
                        {selectedPatient.patientName || selectedPatient.patient?.name || 'Unknown Patient'}
                      </h1>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                        In Session
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium">
                      Token: <span className="text-slate-800 font-bold">#{selectedPatient.tokenNumber || selectedPatient.token}</span> • 
                      Age: <span className="text-slate-800 font-bold">{selectedPatient.patient?.age || 'N/A'}</span> • 
                      Gender: <span className="text-slate-800 font-bold">{selectedPatient.patient?.gender || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveConsultation} className="space-y-8 max-w-4xl">
                  
                  {/* Vitals Section */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Patient Vitals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Blood Pressure</label>
                        <div className="flex items-center gap-2">
                          <input type="number" required placeholder="120" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={vitalsData.bpSystolic} onChange={(e) => setVitalsData({...vitalsData, bpSystolic: e.target.value})} />
                          <span className="text-slate-400 font-light">/</span>
                          <input type="number" required placeholder="80" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={vitalsData.bpDiastolic} onChange={(e) => setVitalsData({...vitalsData, bpDiastolic: e.target.value})} />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Heart Rate</label>
                        <input type="number" required placeholder="72" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                          value={vitalsData.pulseBpm} onChange={(e) => setVitalsData({...vitalsData, pulseBpm: e.target.value})} />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Weight (Kg)</label>
                        <input type="number" step="0.1" required placeholder="65.5" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                          value={vitalsData.weightKg} onChange={(e) => setVitalsData({...vitalsData, weightKg: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Section */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Diagnosis
                    </h3>
                    <div className="space-y-4">
                      <input type="text" placeholder="Primary Symptoms (e.g. Fever, Cough)" className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={vitalsData.symptoms} onChange={(e) => setVitalsData({...vitalsData, symptoms: e.target.value})} />
                      <textarea rows={3} placeholder="Clinical Notes..." className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                        value={vitalsData.doctorNotes} onChange={(e) => setVitalsData({...vitalsData, doctorNotes: e.target.value})}></textarea>
                    </div>
                  </div>

                  {/* NEW e-Prescription Section */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-indigo-600" /> e-Prescription (Medicines)
                    </h3>
                    
                    {/* Add Medicine Form */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Select Medicine</label>
                          <select 
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={currentMed.medicineId} onChange={(e) => setCurrentMed({...currentMed, medicineId: e.target.value})}
                          >
                            <option value="">-- Choose Medicine --</option>
                            {medicinesList.map(med => (
                              <option key={med.id} value={med.id}>{med.name} (Available: {med.stockQuantity ?? med.stock ?? 0})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Dosage</label>
                          <input type="text" placeholder="1-0-1" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={currentMed.dosage} onChange={(e) => setCurrentMed({...currentMed, dosage: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Duration (Days)</label>
                          <input type="number" placeholder="5" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={currentMed.durationDays} onChange={(e) => setCurrentMed({...currentMed, durationDays: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Instructions (Optional)</label>
                          <input type="text" placeholder="After food..." className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={currentMed.instructions} onChange={(e) => setCurrentMed({...currentMed, instructions: e.target.value})} />
                        </div>
                        <button type="button" onClick={addMedicine} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors h-[42px] cursor-pointer">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Prescribed Medicines List */}
                    {prescriptions.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <tr>
                              <th className="p-3 font-semibold">Medicine</th>
                              <th className="p-3 font-semibold">Dosage</th>
                              <th className="p-3 font-semibold">Duration</th>
                              <th className="p-3 font-semibold">Instructions</th>
                              <th className="p-3 font-semibold text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {prescriptions.map((p, idx) => (
                              <tr key={idx} className="bg-white">
                                <td className="p-3 font-medium text-slate-800">{p.medicineName}</td>
                                <td className="p-3 font-medium text-indigo-600">{p.dosage}</td>
                                <td className="p-3">{p.durationDays} days</td>
                                <td className="p-3 text-slate-500">{p.instructions || '-'}</td>
                                <td className="p-3 text-center">
                                  <button type="button" onClick={() => removeMedicine(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-colors cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      <Save className="w-5 h-5" />
                      {loading ? "Saving Record..." : "Complete Consultation & Prescription"}
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
