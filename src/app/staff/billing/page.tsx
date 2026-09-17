'use client';
import { useState, useEffect } from 'react';

export default function BillingDashboard() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleCreateInvoice = async () => {
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultFee: 150,
          pharmacyFee: 40,
          status: 'PAID',
          method: 'UPI'
        })
      });
      if (res.ok) {
        await fetchBills();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Billing & Invoices</h2>
          <p className="text-slate-500">Generate patient receipts and track payments with PostgreSQL.</p>
        </div>
        <button 
          onClick={handleCreateInvoice}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          + Create New Invoice
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="p-0 relative z-10">
          {loading ? (
            <p className="p-8 text-slate-500">Loading invoices from database...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="p-6">Invoice #</th>
                  <th className="p-6">Patient Name</th>
                  <th className="p-6">Total Amount</th>
                  <th className="p-6">Payment Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bills.map(bill => (
                  <tr key={bill.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="p-6 font-bold text-slate-900">{bill.id}</td>
                    <td className="p-6 text-slate-600 font-medium">{bill.patient}</td>
                    <td className="p-6 text-slate-900 font-extrabold text-lg">${bill.totalAmount ?? (bill.consultFee + bill.pharmacyFee)}</td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border 
                        ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="text-indigo-600 font-bold hover:text-indigo-800 text-sm px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
                        Print PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No invoices recorded yet. Click &apos;+ Create New Invoice&apos; to generate one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
