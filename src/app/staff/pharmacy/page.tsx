'use client';

import { useState } from 'react';

export default function PharmacyDashboard() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Paracetamol 500mg', stock: 150, price: 5 },
    { id: 2, name: 'Amoxicillin 250mg', stock: 45, price: 12 },
    { id: 3, name: 'Cough Syrup 100ml', stock: 12, price: 8 },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Pharmacy & Inventory</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          + Add New Medicine
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-800">Current Stock</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Medicine Name</th>
                <th className="p-4 font-semibold">Current Stock</th>
                <th className="p-4 font-semibold">Price per unit</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(med => (
                <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-800">{med.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${med.stock < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {med.stock} Units
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">${med.price.toFixed(2)}</td>
                  <td className="p-4">
                    <button className="text-indigo-600 font-medium hover:text-indigo-800 text-sm mr-4">Restock</button>
                    <button className="text-red-600 font-medium hover:text-red-800 text-sm">Sell</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
