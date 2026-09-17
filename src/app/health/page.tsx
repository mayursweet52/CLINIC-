'use client';
import { useState } from 'react';

export default function PatientPortal() {
  const [patientCode, setPatientCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientCode })
      });
      
      if (!res.ok) {
        throw new Error('Patient not found');
      }
      
      const data = await res.json();
      setPatientData(data);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Invalid Patient Code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="m-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Access Your Records</h2>
          <p className="text-slate-500 text-sm mb-8">Enter your unique Patient Code to view your medical history, prescriptions, and lab reports securely.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. PAT-1001" 
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
              required
              className="w-full text-center text-xl tracking-widest px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-900"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              {loading ? 'Verifying...' : 'View My Records'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 w-full mt-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {patientData.name}</h2>
          <p className="text-slate-500 font-medium mt-1">Patient ID: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">{patientCode}</span></p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">Log Out</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Past Visits */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {patientData.appointments.map((appt: any) => (
            <div key={appt.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Visit Record</h3>
              <div className="p-4 bg-[#fafafa] border border-slate-100 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{appt.doctor?.name || 'Doctor'}</p>
                    <p className="text-xs text-slate-500">{new Date(appt.appointmentDate).toDateString()}</p>
                  </div>
                </div>
                {appt.vitals && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Doctor Notes:</span> {appt.vitals.doctorNotes || 'No notes'}</p>
                    <p className="text-xs text-slate-500 mt-1"><span className="font-bold text-slate-700">Vitals:</span> BP {appt.vitals.bpSystolic}/{appt.vitals.bpDiastolic}, Temp {appt.vitals.temperature}°F</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {patientData.appointments.length === 0 && (
             <p className="text-slate-500">No past visits found.</p>
          )}
        </div>

        {/* Lab Reports */}
        <div className="col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Lab Reports</h3>
            {patientData.labReports && patientData.labReports.length > 0 ? (
              <div className="space-y-4">
                {patientData.labReports.map((report: any) => (
                  <div key={report.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-bold text-sm text-slate-900">{report.testName}</p>
                    <p className="text-xs text-slate-500 mb-2">Result: <span className="font-semibold text-slate-700">{report.result}</span></p>
                    {report.pdfUrl && <a href={report.pdfUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">View PDF Document</a>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center px-4">
                <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="text-sm font-medium text-slate-500">No lab reports uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
