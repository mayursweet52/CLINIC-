"use client";
import { useState, useEffect } from "react";
import { Receipt, CreditCard, Printer, CheckCircle, FileText, Search } from "lucide-react";

export default function BillingDashboard() {
  const [bills, setBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBills = async () => {
    try {
      const res = await fetch("/api/billing");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setBills(data);
          setSelectedBill((prev: any) => {
            if (!prev && data.length > 0) return data[0];
            if (prev) {
              const stillExists = data.find((b: any) => b.id === prev.id);
              return stillExists || (data.length > 0 ? data[0] : null);
            }
            return null;
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch bills", error);
    }
  };

  useEffect(() => {
    fetchBills();
    const interval = setInterval(fetchBills, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handlePayment = async () => {
    if (!selectedBill) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBill.id,
          paymentStatus: "PAID"
        })
      });

      if (res.ok) {
        alert("✅ Payment Collected Successfully!");
        setSelectedBill({ ...selectedBill, paymentStatus: "PAID" });
        await fetchBills();
      } else {
        alert("❌ Failed to process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter bills (UNPAID upar, PAID niche, and Search)
  const filteredBills = bills
    .filter(b => 
      b.appointment?.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.paymentStatus === "UNPAID" ? -1 : 1);

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[620px] bg-slate-50 p-6 gap-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:m-0 print:h-auto print:border-none print:shadow-none print:bg-white print:p-0">
      
      {/* LEFT: Bills Queue (Hide when printing) */}
      <div className="w-[350px] bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden print:hidden">
        <div className="p-5 border-b border-slate-100 bg-blue-50/40">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Receipt className="w-5 h-5 text-blue-600" /> Cashier Desk
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoice or patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredBills.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No invoices found</p>
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div 
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedBill?.id === bill.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">{bill.invoiceNo}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${bill.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {bill.paymentStatus}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-700">{bill.appointment?.patient?.name || 'Unknown Patient'}</h3>
                <p className="text-xs font-bold text-blue-600 mt-1">₹{bill.totalAmount}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Invoice Details & Action (This section prints) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col print:border-none print:shadow-none print:m-0">
        {!selectedBill ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 print:hidden p-8">
            <CreditCard className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">Billing Counter</h3>
            <p className="text-sm">Select an invoice from the left queue to collect payment or print.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full print:block">
            
            {/* INVOICE TICKET TO PRINT */}
            <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
              <div className="max-w-2xl mx-auto border border-slate-200 rounded-xl p-8 print:border-none print:p-0">
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-indigo-900 tracking-tight">APEX CLINIC</h1>
                    <p className="text-sm text-slate-500 mt-1">123 Health Avenue, Medical District<br/>Contact: +91 98765 43210</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1">{selectedBill.invoiceNo}</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-md">
                      <span className={`text-xs font-bold uppercase tracking-wider ${selectedBill.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedBill.paymentStatus === 'PAID' ? 'PAID RECEIPT' : 'PAYMENT PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                    <h3 className="font-bold text-slate-800 text-lg">{selectedBill.appointment?.patient?.name || 'Patient'}</h3>
                    <p className="text-sm text-slate-600">Patient ID: {selectedBill.appointment?.patient?.patientCode || 'N/A'}</p>
                    <p className="text-sm text-slate-600">Age/Gender: {selectedBill.appointment?.patient?.age || 'N/A'} / {selectedBill.appointment?.patient?.gender || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Doctor</p>
                    <p className="text-sm font-medium text-slate-800">{new Date(selectedBill.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600 mt-1">Dr. {selectedBill.appointment?.doctor?.name || 'Assigned Doctor'}</p>
                  </div>
                </div>

                {/* Charges Table */}
                <table className="w-full text-left mb-8">
                  <thead className="border-b-2 border-slate-800">
                    <tr>
                      <th className="py-3 text-sm font-bold text-slate-800">Description</th>
                      <th className="py-3 text-sm font-bold text-slate-800 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 text-slate-700 font-medium">Doctor Consultation Fee</td>
                      <td className="py-4 text-right font-semibold">₹{selectedBill.consultationFee}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-slate-700 font-medium">Pharmacy / Medicine Charges</td>
                      <td className="py-4 text-right font-semibold">₹{selectedBill.medicineCharges}</td>
                    </tr>
                    {selectedBill.discount > 0 && (
                      <tr>
                        <td className="py-4 text-rose-600 font-medium">Discount Applied</td>
                        <td className="py-4 text-right font-semibold text-rose-600">- ₹{selectedBill.discount}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800">
                    <tr>
                      <td className="py-4 text-lg font-bold text-slate-900">Total Amount</td>
                      <td className="py-4 text-xl font-black text-indigo-700 text-right">₹{selectedBill.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer Notes */}
                <div className="text-center text-xs text-slate-400 mt-12 pt-6 border-t border-slate-100">
                  <p>Thank you for choosing Apex Clinic. Wishing you a speedy recovery!</p>
                  <p className="mt-1">This is a computer-generated invoice and does not require a signature.</p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (Hide when printing) */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center print:hidden">
              <button 
                type="button"
                onClick={handlePrint}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-5 h-5" /> Print Invoice
              </button>
              
              {selectedBill.paymentStatus === "UNPAID" ? (
                <button 
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" /> {loading ? "Processing..." : "Collect Payment"}
                </button>
              ) : (
                <div className="bg-emerald-100 text-emerald-700 font-bold py-3 px-8 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Payment Received
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
