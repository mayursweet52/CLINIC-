"use client";
import { useState, useEffect } from "react";
import { Pill, CheckCircle, AlertCircle, ShoppingBag, DollarSign } from "lucide-react";

export default function PharmacyDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Un patients ko fetch karo jinka consultation "COMPLETED" hai aur unke paas prescription hai
  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();

      if (Array.isArray(data)) {
        const pharmacyQueue = data.filter((a: any) => 
          (a.status === "COMPLETED" || a.rawStatus === "COMPLETED" || a.status === "Completed") && 
          a.prescriptions && 
          a.prescriptions.length > 0
        );
        setAppointments(pharmacyQueue);

        // Auto select first if available and none selected
        setSelectedAppt((prev: any) => {
          if (!prev && pharmacyQueue.length > 0) return pharmacyQueue[0];
          if (prev) {
            const stillExists = pharmacyQueue.find((a: any) => a.id === prev.id);
            return stillExists || (pharmacyQueue.length > 0 ? pharmacyQueue[0] : null);
          }
          return null;
        });
      }
    } catch (error) {
      console.error("Failed to fetch pharmacy queue", error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(fetchPrescriptions, 15000);
    return () => clearInterval(interval);
  }, []);

  // Simple formula to calculate total pills based on dosage (e.g. "1-0-1" for 5 days = 2 * 5 = 10 pills)
  const calculateQuantity = (dosage: string, duration: number) => {
    if (!dosage) return duration || 1;
    const parts = dosage.split('-');
    let dailyPills = 0;
    if (parts.length > 1) {
      dailyPills = parts.reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
    } else {
      dailyPills = parseInt(dosage, 10) || 1;
    }
    return Math.max(1, dailyPills * (duration || 1));
  };

  // Dispense Function
  const handleDispense = async () => {
    if (!selectedAppt) return;
    setLoading(true);

    try {
      // API ko bhejne ke liye data prepare karo
      const dispenseItems = selectedAppt.prescriptions.map((p: any) => ({
        medicineId: p.medicine?.id || p.medicineId,
        quantity: calculateQuantity(p.dosage, p.durationDays)
      }));

      const res = await fetch("/api/pharmacy/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          items: dispenseItems
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Medicines Dispensed Successfully! Bill has been updated.");
        setSelectedAppt(null);
        await fetchPrescriptions();
      } else {
        alert("❌ Error: " + (result.error || "Dispense failed"));
      }
    } catch (error) {
      console.error("Error during dispensing:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[620px] bg-slate-50 p-6 gap-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* LEFT: Pharmacy Queue */}
      <div className="w-[350px] bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-emerald-50/40 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> Pending Dispense
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {appointments.length} Left
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {appointments.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20 text-emerald-500" />
              <p className="text-sm font-medium">No pending prescriptions</p>
              <p className="text-xs text-slate-400 mt-1">Prescriptions will appear when doctor completes consultation.</p>
            </div>
          ) : (
            appointments.map((appt) => (
              <div 
                key={appt.id}
                onClick={() => setSelectedAppt(appt)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedAppt?.id === appt.id ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">#{appt.tokenNumber || 'N/A'}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                    {appt.prescriptions.length} Meds
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800">{appt.patient?.name || appt.patientName || 'Unknown Patient'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dr. {appt.doctor?.name || appt.doctor || "Smith"}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Prescription Details & Action */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {!selectedAppt ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <Pill className="w-16 h-16 mb-4 opacity-20 text-slate-400" />
            <h3 className="text-xl font-bold mb-2 text-slate-700">Pharmacy Counter</h3>
            <p className="text-sm">Select a patient from the left queue to dispense medicines.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedAppt.patient?.name || selectedAppt.patientName}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Token: <span className="font-bold text-slate-800">#{selectedAppt.tokenNumber}</span> • 
                  Dr. <span className="font-semibold text-slate-700">{selectedAppt.doctor?.name || selectedAppt.doctor || "Smith"}</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase tracking-wide">
                Ready to Dispense
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" /> Prescribed Medicines
              </h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold text-slate-600">Medicine Name</th>
                      <th className="p-4 font-semibold text-slate-600 text-center">Dosage</th>
                      <th className="p-4 font-semibold text-slate-600 text-center">Required Qty</th>
                      <th className="p-4 font-semibold text-slate-600 text-right">In Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedAppt.prescriptions.map((p: any, idx: number) => {
                      const requiredQty = calculateQuantity(p.dosage, p.durationDays);
                      const currentStock = p.medicine?.stockQuantity ?? p.medicine?.stock ?? 100;
                      const isLowStock = currentStock < requiredQty;

                      return (
                        <tr key={idx} className="bg-white hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-800">
                            {p.medicine?.name || p.medicineName || "Medicine"}
                            <div className="text-xs text-slate-500 font-normal mt-1">{p.instructions || "No special instructions"}</div>
                          </td>
                          <td className="p-4 text-center font-medium text-slate-600">{p.dosage} x {p.durationDays} days</td>
                          <td className="p-4 text-center font-bold text-indigo-600">{requiredQty} Units</td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${isLowStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {currentStock} {isLowStock && <AlertCircle className="w-3 h-3 inline ml-1" />}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Medicine cost will auto-add to the patient's final bill.
              </div>
              <button 
                type="button"
                onClick={handleDispense}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Processing..." : "Dispense Medicines & Bill"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
