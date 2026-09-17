"use client";

export default function ReceptionistDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Receptionist Dashboard</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Live Tokens & Waiting Room</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col items-center text-center">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Dr. Smith</h4>
            <p className="text-6xl font-extrabold text-indigo-700 mb-6">#42</p>
            <button className="text-sm font-semibold bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full max-w-[200px]">
              Call Next Patient
            </button>
          </div>
          <div className="p-8 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col items-center text-center">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Dr. Adams</h4>
            <p className="text-6xl font-extrabold text-blue-700 mb-6">#15</p>
            <button className="text-sm font-semibold bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full max-w-[200px]">
              Call Next Patient
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Walk-in Management</h3>
            <p className="text-slate-500 text-sm">Register a new patient arriving without a prior appointment.</p>
          </div>
          <button className="whitespace-nowrap text-sm font-semibold bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            + Register Walk-in
          </button>
        </div>
      </div>
    </div>
  );
}
