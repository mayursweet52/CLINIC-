"use client";
import { useState, useEffect } from "react";

export default function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@businessos.com" && password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid SuperAdmin Credentials. Try: admin@businessos.com / admin123");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/superadmin/orgs")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrganizations(data);
          } else {
            console.error("API Error:", data);
            setOrganizations([]);
          }
          setLoading(false);
        })
        .catch(err => {
          setOrganizations([]);
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const domain = (form.elements.namedItem("domain") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const city = (form.elements.namedItem("city") as HTMLInputElement).value;

    const res = await fetch("/api/superadmin/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain, phone, city })
    });

    if (res.ok) {
      const newOrg = await res.json();
      setOrganizations([{...newOrg, _count: { users: 0, patients: 0, appointments: 0 }}, ...organizations]);
      setShowModal(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2">Super Admin</h2>
          <p className="text-slate-500 text-center mb-8">Login to manage all hospital tenants.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Admin Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@businessos.com"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2">
              Login to Control Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (selectedOrg) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 relative">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <button onClick={() => setSelectedOrg(null)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedOrg.name}</h2>
            <p className="text-slate-500 font-medium">{selectedOrg.domain}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${selectedOrg.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
              {selectedOrg.isActive ? "Active" : "Suspended"}
            </span>
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Edit Settings
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="text-slate-400 hover:text-red-500 text-sm font-bold ml-4">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Total Staff</p>
              <h3 className="text-4xl font-black text-slate-900">{selectedOrg._count?.users || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Total Patients</p>
              <h3 className="text-4xl font-black text-slate-900">{selectedOrg._count?.patients || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Appointments</p>
              <h3 className="text-4xl font-black text-slate-900">{selectedOrg._count?.appointments || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Status</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedOrg.isActive ? "Healthy" : "Disabled"}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Organization Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Clinic ID</p>
              <p className="text-slate-900 font-mono font-medium">{selectedOrg.id}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
              <p className="text-slate-900 font-medium">{selectedOrg.phone || "Not Set"}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">City / Location</p>
              <p className="text-slate-900 font-medium">{selectedOrg.city || "Not Set"}, {selectedOrg.state || ""}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Address</p>
              <p className="text-slate-900 font-medium">{selectedOrg.address || "Not Set"}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Created On</p>
              <p className="text-slate-900 font-medium">{new Date(selectedOrg.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tenants / Clinics</h2>
          <p className="text-slate-500">Manage all healthcare organizations using the BusinessOS platform.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAuthenticated(false)} className="text-slate-400 hover:text-red-500 font-bold text-sm">Logout</button>
          <button onClick={() => setShowModal(true)} className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95">
            + Onboard New Clinic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-slate-500 font-medium">Loading organizations...</p>
        ) : (
          organizations.map(org => (
            <div key={org.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-xl">
                  {org.name.charAt(0)}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${org.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                  {org.isActive ? "Active" : "Suspended"}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{org.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 mb-6">{org.domain}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Staff</p>
                  <p className="text-lg font-black text-slate-800">{org._count?.users || 0}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Patients</p>
                  <p className="text-lg font-black text-slate-800">{org._count?.patients || 0}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Appts</p>
                  <p className="text-lg font-black text-slate-800">{org._count?.appointments || 0}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400 text-xs">ID: {org.id.split("-")[0]}...</span>
                <button onClick={() => setSelectedOrg(org)} className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                  Manage <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                  <input name="phone" type="text" placeholder="9876543210" className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">City</label>
                  <input name="city" type="text" placeholder="Mumbai" className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-900" />
                </div>
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

