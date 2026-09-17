"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('Doctor');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (role === 'Receptionist') {
        router.push('/staff/receptionist');
      } else {
        router.push('/staff');
      }
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">Staff Login</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Enter your staff credentials</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Staff ID / Email</label>
            <input type="text" required className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50" placeholder="e.g. DOC-1234" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input type="password" required className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50"
            >
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>Authorized Personnel Only:</strong> Accessing patient records without authorization is strictly prohibited. All actions are logged for security and compliance.
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-4">
            {loading ? 'Authenticating...' : 'Secure Staff Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
