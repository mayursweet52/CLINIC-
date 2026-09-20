'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ROLE_PRESETS: Record<string, { email: string; destination: string; label: string; icon: string }> = {
  Doctor: {
    email: 'dr.smith@clinic.com',
    destination: '/staff',
    label: 'Doctor Console',
    icon: '🩺'
  },
  Receptionist: {
    email: 'reception@clinic.com',
    destination: '/staff/receptionist',
    label: 'Reception & Queue',
    icon: '📋'
  },
  Admin: {
    email: 'admin@clinic.com',
    destination: '/superadmin',
    label: 'Hospital & SuperAdmin',
    icon: '👑'
  },
  Pharmacist: {
    email: 'pharmacy@clinic.com',
    destination: '/staff/pharmacy',
    label: 'Pharmacy Counter',
    icon: '💊'
  },
  Cashier: {
    email: 'billing@clinic.com',
    destination: '/staff/billing',
    label: 'Billing & Cashier',
    icon: '🧾'
  },
  Finance: {
    email: 'finance@clinic.com',
    destination: '/staff/finance',
    label: 'Finance & Ledger',
    icon: '📊'
  }
};

export default function StaffLogin() {
  const [email, setEmail] = useState('dr.smith@clinic.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Doctor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (ROLE_PRESETS[newRole]) {
      setEmail(ROLE_PRESETS[newRole].email);
    }
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string, customRole?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    const targetEmail = customEmail || email;
    const targetPass = customPass || password;
    const targetRole = customRole || role;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPass, role: targetRole.toUpperCase() })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Login failed');
      }

      // Smart routing based on role
      const normalizedRole = (resData.role || targetRole).toUpperCase();
      if (normalizedRole === 'RECEPTIONIST') {
        router.push('/staff/receptionist');
      } else if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPERADMIN' || normalizedRole === 'OWNER') {
        router.push('/superadmin');
      } else if (normalizedRole === 'PHARMACIST') {
        router.push('/staff/pharmacy');
      } else if (normalizedRole === 'CASHIER' || normalizedRole === 'ACCOUNTANT') {
        router.push('/staff/billing');
      } else if (normalizedRole === 'FINANCE') {
        router.push('/staff/finance');
      } else {
        router.push('/staff');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const quickLogin = (loginRole: string, loginEmail: string) => {
    setEmail(loginEmail);
    setPassword('password123');
    setRole(loginRole);
    handleLogin(undefined, loginEmail, 'password123', loginRole);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-sans relative overflow-hidden py-10 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 p-6">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          ← Back to Master Hub
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold border border-indigo-100 shadow-sm">
              S
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Staff Access</h2>
              <p className="text-slate-500 text-xs">Clinic Management System Workstation</p>
            </div>
          </div>

          {/* 1-Click Instant Demo Logins Grid */}
          <div className="mb-6 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">1-Click Instant Demo Login</p>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Select Role</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => quickLogin('Doctor', 'dr.smith@clinic.com')}
                disabled={loading}
                className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-xs group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">🩺 Dr. Smith</p>
                <p className="text-[10px] text-slate-400">Doctor Console</p>
              </button>

              <button 
                type="button"
                onClick={() => quickLogin('Receptionist', 'reception@clinic.com')}
                disabled={loading}
                className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-xs group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">📋 Reception</p>
                <p className="text-[10px] text-slate-400">Walk-In & Queue</p>
              </button>

              <button 
                type="button"
                onClick={() => quickLogin('Admin', 'admin@clinic.com')}
                disabled={loading}
                className="p-3 bg-indigo-50/50 hover:bg-indigo-100/60 border border-indigo-200 hover:border-indigo-400 rounded-xl text-left transition-all shadow-xs group"
              >
                <p className="text-xs font-black text-indigo-700">👑 Admin</p>
                <p className="text-[10px] text-indigo-500">SuperAdmin Hub</p>
              </button>

              <button 
                type="button"
                onClick={() => quickLogin('Pharmacist', 'pharmacy@clinic.com')}
                disabled={loading}
                className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-xs group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">💊 Pharmacy</p>
                <p className="text-[10px] text-slate-400">Stock & Dispense</p>
              </button>

              <button 
                type="button"
                onClick={() => quickLogin('Cashier', 'billing@clinic.com')}
                disabled={loading}
                className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-xs group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">🧾 Cashier</p>
                <p className="text-[10px] text-slate-400">Bills & Invoices</p>
              </button>

              <button 
                type="button"
                onClick={() => quickLogin('Finance', 'finance@clinic.com')}
                disabled={loading}
                className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-xs group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">📊 Finance</p>
                <p className="text-[10px] text-slate-400">Clinic Ledger</p>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Role</label>
              <select 
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-bold text-slate-800 cursor-pointer"
              >
                <option value="Doctor">🩺 Doctor (Consultation & Rx)</option>
                <option value="Receptionist">📋 Receptionist (Check-in & Queue)</option>
                <option value="Admin">👑 Admin (Hospital Management & Settings)</option>
                <option value="Pharmacist">💊 Pharmacist (Medicine Counter)</option>
                <option value="Cashier">🧾 Cashier (Billing & Payments)</option>
                <option value="Finance">📊 Finance Manager (Ledger & Reports)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 rounded-xl p-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                placeholder="admin@clinic.com"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-medium text-slate-900 font-mono"
                placeholder="password123"
                required
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : `Sign In as ${role} →`}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
            <span>Default Password: <strong className="font-mono text-slate-600">password123</strong></span>
            <Link href="/superadmin" className="text-indigo-600 font-bold hover:underline">Direct SuperAdmin Link →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
