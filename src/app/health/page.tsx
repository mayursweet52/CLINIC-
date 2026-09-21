'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function PatientPortal() {
  const [patientCode, setPatientCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchRecord = async (codeToSearch: string) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientCode: codeToSearch })
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Patient not found');
      }
      
      setPatientData(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Invalid Patient Code or Token Number. Please verify.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCode.trim()) return;
    fetchRecord(patientCode);
  };

  const handleQuickSelect = (code: string) => {
    setPatientCode(code);
    fetchRecord(code);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-blue-100 selection:text-blue-900">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Access Your Records</h2>
            <p className="text-slate-500 text-sm mb-6">Enter your Patient Code, Token Number, or Mobile to view your digital prescription and visit history.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="e.g. PAT-1001 or #101" 
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                  required
                  className="w-full text-center text-lg tracking-wider px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl animate-in fade-in">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'View My Records →'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Instant Demo Logins</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => handleQuickSelect('PAT-1001')} 
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                  PAT-1001 (Cardiology)
                </button>
                <button 
                  onClick={() => handleQuickSelect('PAT-1002')} 
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                  PAT-1002 (Diabetic)
                </button>
                <button 
                  onClick={() => handleQuickSelect('101')} 
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                  Token #101
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/book" className="text-sm font-semibold text-blue-600 hover:underline">
              ← Book a new appointment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans px-4 py-8 max-w-6xl mx-auto animate-in fade-in duration-500 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patientData.name}</h1>
            <span className="bg-blue-100 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
              {patientData.bloodGroup || "B+"}
            </span>
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1 flex flex-wrap items-center gap-2">
            <span>Patient ID: <strong className="text-slate-800">{patientData.patientCode}</strong></span>
            <span>•</span>
            <span>Token: <strong className="text-blue-600">#{patientData.tokenNumber || "101"}</strong></span>
            <span>•</span>
            <span>Hospital: <strong className="text-slate-700">{patientData.hospitalName || "City Care Super Multi-Speciality Hospital"}</strong></span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print Prescription
          </button>
          <button 
            onClick={() => { setIsAuthenticated(false); setPatientCode(''); }} 
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visits & Prescriptions (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {patientData.appointments && patientData.appointments.length > 0 ? (
            patientData.appointments.map((appt: any, idx: number) => (
              <div key={appt.id || idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                {/* Appointment Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                      {appt.status || "Confirmed Consultation"}
                    </span>
                    <h3 className="text-xl font-black text-slate-900">{appt.doctor?.name || "Dr. Rajesh Sharma"}</h3>
                    <p className="text-slate-500 text-xs font-medium">{appt.doctor?.specialization || appt.doctor?.department || "General Specialist"} • {appt.hospitalName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">Token #{appt.tokenNumber || "101"}</p>
                    <p className="text-xs text-slate-400 font-medium">{new Date(appt.appointmentDate).toLocaleDateString("en-IN", { dateStyle: "medium" })} • {appt.timeSlot || "10:30 AM"}</p>
                  </div>
                </div>

                {/* Vitals Recorded */}
                {appt.vitals && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Clinical Notes & Vitals</p>
                    <p className="text-sm font-medium text-slate-700 mb-4">{appt.vitals.doctorNotes || "Routine consultation checkup. Patient vitals recorded stable."}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Blood Pressure</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">{appt.vitals.bpSystolic}/{appt.vitals.bpDiastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span></p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Pulse Rate</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">{appt.vitals.pulse} <span className="text-[10px] text-slate-400 font-normal">bpm</span></p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Temperature</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">{appt.vitals.temperature}°F</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                        <p className="text-sm font-black text-green-600 mt-0.5">Normal</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Prescription (Rx) */}
                {appt.prescription && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">Rx</span>
                      <h4 className="font-extrabold text-slate-900 text-base">Prescribed Medications</h4>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {appt.prescription.medicines?.map((med: any, mIdx: number) => (
                        <div key={mIdx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white hover:bg-slate-50/50 transition-colors">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{med.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{med.timing || "After Meals"}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
                              Dosage: {med.dosage}
                            </span>
                            <span className="text-slate-500">
                              Duration: {med.days}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {appt.prescription.diet && (
                      <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Diet & Instructions</p>
                        <p className="text-xs text-amber-900 font-medium">{appt.prescription.diet} {appt.prescription.instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-400">No medical visits found for this record.</p>
            </div>
          )}
        </div>

        {/* Right Column: Lab Reports & Quick Info (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center justify-between">
              <span>Diagnostic Lab Reports</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {patientData.labReports?.length || 0} Reports
              </span>
            </h3>

            {patientData.labReports && patientData.labReports.length > 0 ? (
              <div className="space-y-3">
                {patientData.labReports.map((report: any) => (
                  <div key={report.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 hover:bg-blue-50/30 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="font-bold text-sm text-slate-900">{report.testName}</p>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-700">
                        {report.status || "NORMAL"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mb-1">{report.result}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Ref Range: {report.normalRange || "Standard"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="text-xs text-slate-400 font-semibold">No lab reports on file.</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md shadow-blue-200">
            <h4 className="font-black text-base mb-2">Need Further Assistance?</h4>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">You can show this digital prescription at our hospital pharmacy counter or reception for instant medicine dispensing.</p>
            <div className="text-xs font-bold bg-white/20 px-3 py-2 rounded-xl backdrop-blur-xs flex justify-between">
              <span>Emergency Helpline:</span>
              <span>108 / 112</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
