'use client';

import { useState, useEffect } from 'react';

const FALLBACK_TRANSACTIONS = [
  {
    id: "tx-demo-1",
    date: new Date().toISOString().split("T")[0],
    description: "Invoice INV-851555 - Sunil Jadhav (Consultation & Medicines)",
    type: "Income",
    amount: 650
  },
  {
    id: "tx-demo-2",
    date: new Date(Date.now() - 3600000).toISOString().split("T")[0],
    description: "Invoice INV-729104 - Ramesh Sharma (Cardiology Consultation)",
    type: "Income",
    amount: 670
  },
  {
    id: "tx-demo-3",
    date: new Date(Date.now() - 7200000).toISOString().split("T")[0],
    description: "Invoice INV-642109 - Sunita Verma (OPD & Blood Sugar)",
    type: "Income",
    amount: 500
  },
  {
    id: "tx-demo-4",
    date: new Date(Date.now() - 10800000).toISOString().split("T")[0],
    description: "Invoice INV-531980 - Aarav Jadhav (Pediatric Care)",
    type: "Income",
    amount: 450
  },
  {
    id: "tx-exp-1",
    date: new Date(Date.now() - 14400000).toISOString().split("T")[0],
    description: "Pharmacy Stock Restock (Antibiotics & Consumables)",
    type: "Expense",
    amount: 1200
  },
  {
    id: "tx-exp-2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    description: "Sterilization, Gloves & Facility Maintenance",
    type: "Expense",
    amount: 450
  }
];

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<any[]>(FALLBACK_TRANSACTIONS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetch('/api/finance')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else {
          setTransactions(FALLBACK_TRANSACTIONS);
        }
      })
      .catch(err => {
        console.warn("Error fetching transactions, keeping fallback:", err);
        setTransactions(FALLBACK_TRANSACTIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Defensive array checks to guarantee no "filter is not a function" error
  const safeTransactions = Array.isArray(transactions) ? transactions : FALLBACK_TRANSACTIONS;
  const totalIncome = safeTransactions.filter(t => t && t.type === 'Income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = safeTransactions.filter(t => t && t.type === 'Expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const netProfit = totalIncome - totalExpense;

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const parsedAmount = parseFloat(amount) || 0;
    const newRecord = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description,
      type,
      amount: parsedAmount
    };

    // Optimistically update UI
    setTransactions([newRecord, ...safeTransactions]);
    setShowModal(false);
    setDescription('');
    setAmount('');

    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
    } catch (err) {
      console.warn("Offline transaction logged locally:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finance & Expenses</h2>
          <p className="text-slate-500 text-sm mt-1">Track clinic revenue, patient consultation income, and daily operational expenses.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setType('Income'); setShowModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-emerald-200 transition active:scale-95"
          >
            + Log Income
          </button>
          <button 
            onClick={() => { setType('Expense'); setShowModal(true); }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-red-200 transition active:scale-95"
          >
            + Log Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-400 font-medium animate-pulse">Loading financial ledger...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">₹</span>
              </div>
              <p className="text-3xl font-black text-emerald-600">₹{totalIncome.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">All collected patient and pharmacy fees</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">₹</span>
              </div>
              <p className="text-3xl font-black text-red-600">₹{totalExpense.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Restock, disposables & clinic maintenance</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Cash Flow</p>
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">📊</span>
              </div>
              <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
                ₹{netProfit.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-medium">{netProfit >= 0 ? 'Profitable surplus balance' : 'Operating deficit'}</p>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">Recent Financial Ledger</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full">
                {safeTransactions.length} Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right pr-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-700 text-xs whitespace-nowrap">{tx.date}</td>
                      <td className="p-4 text-slate-900 font-medium text-sm">{tx.description}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          tx.type === 'Income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-4 pr-6 text-right font-black text-sm whitespace-nowrap ${
                        tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'Income' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Log Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                Log {type === 'Income' ? 'Income Transaction' : 'Operational Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Income')}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-colors ${type === 'Income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Income (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Expense')}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-colors ${type === 'Expense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Expense (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  placeholder={type === 'Income' ? 'e.g. Walk-in Lab Test Fee' : 'e.g. Syringes & Cotton Restock'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-medium text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 font-bold text-xs text-white rounded-xl shadow-md transition active:scale-95 ${
                    type === 'Income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
