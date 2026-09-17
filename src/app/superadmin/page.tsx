'use client';
import { useState, useEffect } from 'react';

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/superadmin/orgs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrganizations(data);
        } else {
          console.error("API Error:", data);
          setOrganizations([]);
          alert(data.error || "Failed to load organizations");
        }
        setLoading(false);
      })
      .catch(err => {
        setOrganizations([]);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const domain = (form.elements.namedItem('domain') as HTMLInputElement).value;

    const res = await fetch('/api/superadmin/orgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, domain })
    });

    if (res.ok) {
      const newOrg = await res.json();
      setOrganizations([newOrg, ...organizations]);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tenants / Clinics</h2>
          <p className="text-slate-500">Manage all healthcare organizations using the BusinessOS platform.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95">
          + Onboard New Clinic
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
           <p>Loading organizations...</p>
        ) : (
          organizations.map(org => (
            <div key={org.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-xl">
                  {org.name.charAt(0)}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${org.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {org.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{org.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 mb-6">{org.domain}</p>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">ID: {org.id.split('-')[0]}...</span>
                <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Manage →</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 w-full max-w-md scale-in-95 duration-200">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">New Clinic Tenant</h2>
            <p className="text-slate-500 text-sm mb-6">Create an isolated workspace and database tenant for a new client.</p>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Clinic Name</label>
                <input name="name" type="text" required placeholder="e.g. Apollo Hospital" className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Domain / URL</label>
                <input name="domain" type="text" required placeholder="e.g. apollo.businessos.co.in" className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-900" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95">Create Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
