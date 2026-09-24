"use client";

import { useState, useEffect, use } from "react";
import { CheckCircle2, Loader2, AlertCircle, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [billData, setBillData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/bills/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.bill.paymentStatus !== "PAID") {
          window.location.href = `/pay/${token}`;
          return;
        }
        setBillData(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="p-8 text-center text-error"><AlertCircle className="w-10 h-10 mx-auto mb-4" />{error}</div>;
  if (!billData) return null;

  const { bill, clinic, patient } = billData;

  return (
    <div className="min-h-screen bg-surface p-4 flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="bg-success text-white rounded-t-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 translate-y-1/2 rounded-t-full scale-150" />
          <div className="relative z-10">
            <CheckCircle2 className="w-20 h-20 mx-auto mb-4 animate-in zoom-in duration-500" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-success-50 text-sm mb-4">Invoice {bill.invoiceNo}</p>
            <p className="text-5xl font-bold">₹{bill.totalAmount}</p>
          </div>
        </div>

        <div className="bg-surface-lowest rounded-b-2xl shadow-sm border border-t-0 border-outline-variant p-6 space-y-6 relative">
          {/* Zig-zag border top illusion */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-success flex">
            {/* simple css pattern for receipt teeth could go here */}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Payment Status</span>
              <span className="font-bold text-success uppercase">PAID</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Date</span>
              <span className="font-medium">{new Date(bill.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Patient</span>
              <span className="font-medium">{patient.firstName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Clinic</span>
              <span className="font-medium text-right max-w-[200px]">{clinic.name}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-outline-variant pt-6 space-y-3">
            <Button className="w-full h-12 gap-2" variant="outline">
              <Download className="w-4 h-4" /> Download Receipt
            </Button>
            <Button className="w-full h-12 gap-2" asChild>
              <a href="/"><ArrowLeft className="w-4 h-4" /> Back to Home</a>
            </Button>
          </div>
        </div>
        
        <p className="text-center text-xs text-on-surface-variant mt-6">
          A copy of this receipt has been sent to your registered phone number.
        </p>
      </div>
    </div>
  );
}
