'use client';

import { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  CheckCircle, 
  Clock, 
  Printer, 
  Plus, 
  FileText, 
  Save, 
  Sparkles, 
  AlertCircle,
  Building2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { useRealtime, playHospitalChime } from '@/hooks/useRealtime';

interface LabOrder {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  testName: string;
  category: string;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'REPORT_READY';
  createdAt: string;
  results?: Record<string, { value: string; unit: string; normalRange: string; status: 'NORMAL' | 'HIGH' | 'LOW' }>;
  notes?: string;
}

export default function LabDashboard() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SAMPLE_COLLECTED' | 'REPORT_READY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form parameters for editing
  const [formResults, setFormResults] = useState<Record<string, { value: string; unit: string; normalRange: string; status: 'NORMAL' | 'HIGH' | 'LOW' }>>({});
  const [formNotes, setFormNotes] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/lab');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        if (!selectedOrder && data.length > 0) {
          selectOrder(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch lab orders', e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const selectOrder = (order: LabOrder) => {
    setSelectedOrder(order);
    if (order.results && Object.keys(order.results).length > 0) {
      setFormResults(order.results);
    } else {
      // Default parameters based on test type
      if (order.testName.includes('Blood Sugar') || order.testName.includes('FBS')) {
        setFormResults({
          'Fasting Plasma Glucose': { value: '98', unit: 'mg/dL', normalRange: '70 - 100', status: 'NORMAL' },
          'Post-Prandial Glucose (PPBS)': { value: '135', unit: 'mg/dL', normalRange: '< 140', status: 'NORMAL' },
          'HbA1c (Glycated Hb)': { value: '5.6', unit: '%', normalRange: '< 5.7', status: 'NORMAL' }
        });
      } else if (order.testName.includes('Lipid')) {
        setFormResults({
          'Total Cholesterol': { value: '185', unit: 'mg/dL', normalRange: '< 200', status: 'NORMAL' },
          'Triglycerides': { value: '140', unit: 'mg/dL', normalRange: '< 150', status: 'NORMAL' },
          'HDL Cholesterol': { value: '48', unit: 'mg/dL', normalRange: '> 40', status: 'NORMAL' },
          'LDL Cholesterol': { value: '109', unit: 'mg/dL', normalRange: '< 100', status: 'NORMAL' }
        });
      } else {
        // CBC Default
        setFormResults({
          'Hemoglobin (Hb)': { value: '13.8', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'NORMAL' },
          'Total WBC Count': { value: '6,900', unit: '/cumm', normalRange: '4,000 - 11,000', status: 'NORMAL' },
          'Platelet Count': { value: '2.5', unit: 'Lakhs/cumm', normalRange: '1.5 - 4.5', status: 'NORMAL' },
          'RBC Count': { value: '4.8', unit: 'mil/cumm', normalRange: '4.5 - 5.5', status: 'NORMAL' },
          'ESR (1st Hour)': { value: '10', unit: 'mm/hr', normalRange: '0 - 15', status: 'NORMAL' }
        });
      }
    }
    setFormNotes(order.notes || 'Specimen processed and verified in accordance with laboratory protocols.');
  };

  const handleUpdateStatus = async (newStatus: 'SAMPLE_COLLECTED' | 'REPORT_READY') => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          orderId: selectedOrder.id,
          status: newStatus,
          results: formResults,
          notes: formNotes
        })
      });
      if (res.ok) {
        playHospitalChime();
        await fetchOrders();
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, results: formResults, notes: formNotes } : null);
      }
    } catch (e) {
      alert('Failed to update lab order');
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return o.patientName.toLowerCase().includes(q) || o.testName.toLowerCase().includes(q) || String(o.tokenNumber).includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Pathology & Diagnostic Laboratory Desk
            </h1>
            <p className="text-xs text-slate-500 font-medium">Specimen Tracking • Test Entry • Official Reports</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient, token, test..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-64"
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5/12): Orders Queue */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Pills */}
          <div className="flex gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
            {(['ALL', 'PENDING', 'SAMPLE_COLLECTED', 'REPORT_READY'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  filter === tab ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'PENDING' ? 'Pending' : tab === 'SAMPLE_COLLECTED' ? 'Collected' : 'Ready'}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-50/70 border-purple-300 shadow-md ring-2 ring-purple-500/20' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                      #{order.tokenNumber}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      order.status === 'REPORT_READY' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : order.status === 'SAMPLE_COLLECTED'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">{order.patientName}</h3>
                  <p className="text-xs font-bold text-purple-700 mt-1 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    {order.testName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <span>Dr: {order.doctorName}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-400 font-bold text-sm">
                No diagnostic test orders found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7/12): Report Entry & Printable Viewer */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              {/* Order Meta */}
              <div className="flex items-start justify-between pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Order ID: {selectedOrder.id}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Token #{selectedOrder.tokenNumber}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedOrder.patientName}</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Phone: {selectedOrder.patientPhone} • Ref: {selectedOrder.doctorName}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Workflow Stage:</span>
                  <span className="text-xs font-extrabold text-slate-900">{selectedOrder.status.replace('_', ' ')}</span>
                </div>

                <div className="flex gap-2">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus('SAMPLE_COLLECTED')}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                      🧪 Mark Sample Collected
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus('REPORT_READY')}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save & Finalize Report</span>
                  </button>
                </div>
              </div>

              {/* Test Findings Entry Table */}
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Test Parameters & Biological Reference Values
                </h3>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Investigation Parameter</th>
                        <th className="p-3">Observed Value</th>
                        <th className="p-3">Unit</th>
                        <th className="p-3">Biological Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {Object.entries(formResults).map(([param, data]) => (
                        <tr key={param} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{param}</td>
                          <td className="p-3">
                            <input 
                              type="text"
                              value={data.value}
                              onChange={e => {
                                const val = e.target.value;
                                setFormResults(prev => ({
                                  ...prev,
                                  [param]: { ...prev[param], value: val }
                                }));
                              }}
                              className="w-24 p-1.5 font-bold bg-purple-50/50 border border-purple-200 rounded-lg text-slate-900 text-center focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                          </td>
                          <td className="p-3 text-slate-500">{data.unit}</td>
                          <td className="p-3 text-slate-500">{data.normalRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pathologist Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pathologist Interpretation / Remarks</label>
                <textarea 
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="Enter diagnostic summary or recommendations..."
                />
              </div>

              {/* Print Preview Certificate Block */}
              <div className="p-6 bg-purple-50/40 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Official Diagnostic Pathology Slip</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Includes hospital accreditation header, barcode, and digital verification seal.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-white hover:bg-slate-100 text-purple-700 border border-purple-200 text-xs font-black px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  🖨️ Print Diagnostic PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8">
              <FlaskConical className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-bold text-sm">Select a test order from the queue to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
