'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookAppointment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = {
      patientName: (form.elements.namedItem('patientName') as HTMLInputElement).value,
      doctor: (form.elements.namedItem('doctor') as HTMLSelectElement).value,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      time: (form.elements.namedItem('time') as HTMLSelectElement).value,
    };

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/patient');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <Link href="/patient" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        ← Back to My Health
      </Link>

      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Book Consultation</h2>
          <p className="text-slate-500 text-sm mb-10">Select a specialist and choose an available time slot.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Patient Full Name</label>
              <input 
                name="patientName" 
                type="text" 
                required 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-900"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Specialist</label>
              <select 
                name="doctor" 
                required 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-slate-900 cursor-pointer"
              >
                <option value="Dr. Smith (Cardiology)">Dr. Smith (Cardiology)</option>
                <option value="Dr. Adams (Pediatrics)">Dr. Adams (Pediatrics)</option>
                <option value="Dr. Lee (General)">Dr. Lee (General)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Date</label>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-900 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Time Slot</label>
                <select 
                  name="time" 
                  required 
                  className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-slate-900 cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? 'Confirming...' : 'Confirm Appointment →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
