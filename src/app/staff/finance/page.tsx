'use client';

export default function FinanceDashboard() {
  const transactions = [
    { id: 1, date: 'Today', description: 'Patient Consultation (John Doe)', type: 'Income', amount: 150 },
    { id: 2, date: 'Today', description: 'Pharmacy Sale (Paracetamol)', type: 'Income', amount: 10 },
    { id: 3, date: 'Yesterday', description: 'Medical Supplies Restock', type: 'Expense', amount: 350 },
    { id: 4, date: 'Yesterday', description: 'Patient Consultation (Jane Roe)', type: 'Income', amount: 150 },
  ];

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Finance & Expenses</h2>
        <p className="text-slate-500 mt-2">Track clinic revenue and daily expenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${totalIncome}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">${totalExpense}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Net Profit</p>
          <p className="text-3xl font-bold text-indigo-600">${totalIncome - totalExpense}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-800">{tx.date}</td>
                  <td className="p-4 text-slate-600">{tx.description}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">${tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
