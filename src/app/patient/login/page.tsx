"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/patient');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Patient Login</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Enter your credentials to access your portal</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Patient ID / Email</label>
            <input type="text" required className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50" placeholder="e.g. PAT-1234" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password / OTP</label>
            <input type="password" required className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50" placeholder="••••••••" />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Data Privacy Notice:</strong> Your medical data is strictly confidential and end-to-end encrypted. We comply with all regional health data protection regulations.
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mt-4">
            {loading ? 'Authenticating...' : 'Sign In securely'}
          </button>
        </form>
      </div>
    </div>
  );
}
