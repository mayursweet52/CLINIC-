"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookAppointment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [doctor, setDoctor] = useState('Dr. Smith (Cardiology)');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Call the Backend Microservice
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientName: 'Current User', 
        doctor, 
        date, 
        time,
        status: 'Pending' 
      })
    });

    setTimeout(() => {
      setLoading(false);
      router.push('/patient');
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Book an Appointment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Doctor</label>
            <select 
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              required 
              className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-colors"
            >
              <option>Dr. Smith (Cardiology)</option>
              <option>Dr. Adams (Pediatrics)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required 
                className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Time</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required 
                className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-colors" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              {loading ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
