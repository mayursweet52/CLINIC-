'use client';

import { useState, useEffect } from 'react';
import { Medicine } from '@/types';

export default function PharmacyDashboard() {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pharmacy')
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        setLoading(false);
      });
  }, []);

  const handleAddMedicine = async () => {
    const res = await fetch('/api/pharmacy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ibuprofen 400mg', stock: 100, price: 8 })
    });
    if (res.ok) {
      const data = await res.json();
      setInventory([...inventory, data.item]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Pharmacy & Inventory</h2>
        <button onClick={handleAddMedicine} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          + Add Test Medicine
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-800">Current Stock</h3>
        </div>
        <div className="p-0">
          {loading ? (
            <p className="p-6 text-slate-500">Loading inventory from backend...</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
