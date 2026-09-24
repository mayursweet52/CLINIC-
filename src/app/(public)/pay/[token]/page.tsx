"use client";

import { useState, useEffect, use } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicPayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [billData, setBillData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch(`/api/public/bills/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBillData(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const loadScript = () => new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      const isLoaded = await loadScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");

      const res = await fetch("/api/portal/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: billData.bill.id, publicToken: token }),
      });
      const { orderId, amount } = await res.json();
      if (!orderId) throw new Error("Could not create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: amount,
        currency: "INR",
        name: billData.clinic.name,
        description: `Payment for Invoice ${billData.bill.invoiceNo}`,
        order_id: orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/portal/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billId: billData.bill.id,
              publicToken: token,
            }),
          });
          if (verifyRes.ok) {
            window.location.href = `/receipt/${token}`;
          } else {
            alert("Payment verification failed");
            setPaying(false);
          }
        },
        prefill: {
          name: billData.patient.firstName,
          contact: billData.patient.phone,
        },
        theme: { color: "#0066FF" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
      // Keep loading state until modal closes or redirect happens
      rzp.on("payment.failed", () => {
        setPaying(false);
      });
      
    } catch (err: any) {
      alert(err.message);
      setPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="p-8 text-center text-error"><AlertCircle className="w-10 h-10 mx-auto mb-4" />{error}</div>;

  const { bill, clinic, patient, doctor } = billData;
  const isPaid = bill.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-surface p-4 pb-20">
      <div className="max-w-lg mx-auto bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        
        <div className="bg-primary/5 p-6 text-center border-b border-outline-variant">
          <div className="w-16 h-16 bg-primary text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl mb-4">
            {clinic.name[0]}
          </div>
          <h1 className="text-xl font-bold">{clinic.name}</h1>
          <p className="text-sm text-on-surface-variant">{clinic.address}, {clinic.city}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Invoice</p>
              <p className="font-mono font-medium">{bill.invoiceNo}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Date</p>
              <p className="font-medium">{new Date(bill.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-surface-low rounded-xl p-4 space-y-2">
            <p className="text-sm"><span className="text-on-surface-variant">Patient:</span> <span className="font-medium">{patient.firstName}</span></p>
            {doctor && <p className="text-sm"><span className="text-on-surface-variant">Doctor:</span> <span className="font-medium">{doctor.name}</span></p>}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Bill Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Consultation Fee</span>
                <span>₹{bill.consultationFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Medicine Charges</span>
                <span>₹{bill.medicineCharges}</span>
              </div>
              <div className="border-t border-dashed border-outline-variant pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{bill.totalAmount}</span>
              </div>
            </div>
          </div>

          {isPaid ? (
            <div className="bg-success/10 text-success rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <h2 className="font-bold text-xl mb-4">Payment Successful</h2>
              <Button asChild className="w-full">
                <a href={`/receipt/${token}`}>View Receipt</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <Button 
                onClick={handlePayment} 
                disabled={paying} 
                className="w-full h-14 text-lg font-bold shadow-lg"
              >
                {paying ? "Processing..." : `Pay ₹${bill.totalAmount}`}
              </Button>
              <p className="text-center text-xs text-on-surface-variant">
                Or pay securely at the clinic reception.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
