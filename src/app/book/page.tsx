'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    // Fetch all hospitals on load
    fetch('/api/public/hospitals')
      .then(res => res.json())
      .then(data => {
        if (data.hospitals) setHospitals(data.hospitals);
      });
  }, []);

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setSuccessData(null);
    
    // Fetch doctors for this hospital
    fetch(`/api/public/hospitals?orgId=${hospital.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.doctors) setDoctors(data.doctors);
      });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: selectedHospital.id,
          doctorId: selectedDoctor.id,
          patientName,
          patientPhone,
          date: new Date().toISOString(),
          timeSlot: '10:00 AM' // simplified for demo
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessData(data);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">B</div>
            <h1 className="text-xl font-bold tracking-tight">BusinessOS <span className="text-blue-600">Health</span></h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">← Back to Hub</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 py-12">
        {successData ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Appointment Confirmed!</h2>
            <p className="text-slate-500 mb-8">Please visit {successData.hospitalName} at your scheduled time.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Token Number</p>
                <p className="text-2xl font-black text-indigo-600">#{successData.tokenNumber}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Patient Code</p>
                <p className="text-2xl font-black text-slate-900">{successData.patientCode}</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 font-medium">Keep your Patient Code safe. You can use it to view your prescriptions online.</p>
            <button onClick={() => { setSelectedHospital(null); setSuccessData(null); }} className="text-blue-600 font-bold hover:underline">Book Another Appointment</button>
          </div>
        ) : !selectedHospital ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Find a Hospital Near You</h2>
              <p className="text-slate-500 text-lg">Select a healthcare facility to book your appointment online.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hospitals.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => handleHospitalSelect(hospital)}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
                    {hospital.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{hospital.name}</h3>
                  <div className="flex flex-col gap-1 mt-3">
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {hospital.city ? `${hospital.city}, ${hospital.state}` : 'Location not provided'}
                    </p>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {hospital.phone || 'Phone not available'}
                    </p>
                  </div>
                </button>
              ))}
              {hospitals.length === 0 && <p className="text-slate-500 text-center col-span-2">No active hospitals found.</p>}
            </div>
          </div>
        ) : !selectedDoctor ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <button onClick={() => setSelectedHospital(null)} className="text-slate-500 font-bold text-sm hover:text-slate-900 flex items-center gap-1">
              ← Back to Hospitals
            </button>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{selectedHospital.name}</h2>
              <p className="text-slate-500">Select a doctor to continue booking your appointment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map(doctor => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                    DR
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{doctor.name}</h3>
                    <p className="text-indigo-600 text-sm font-medium">{doctor.department}</p>
                  </div>
                </button>
              ))}
              {doctors.length === 0 && <p className="text-slate-500">No doctors available in this hospital.</p>}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setSelectedDoctor(null)} className="text-slate-500 font-bold text-sm hover:text-slate-900 flex items-center gap-1 mb-6">
              ← Back to Doctors
            </button>
            
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Book Appointment</h2>
            <p className="text-slate-500 text-sm mb-6">with <span className="font-bold text-slate-700">{selectedDoctor.name}</span> at {selectedHospital.name}</p>

            <form onSubmit={handleBook} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Patient Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  required 
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  placeholder="9876543210" 
                  className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95 mt-4"
              >
                {isBooking ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
