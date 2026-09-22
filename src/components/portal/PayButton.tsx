'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

interface PayButtonProps {
  billId: string;
  amount: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayButton({ billId, amount }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1. Create order
      const orderRes = await fetch('/api/portal/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderRes.status === 503 && orderData.error === 'Payment not configured yet') {
          toast.error('Payment not configured yet');
          return;
        }
        throw new Error(orderData.error || 'Failed to create order');
      }

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ClinicOS',
        description: `Payment for Bill ${billId}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify payment
            const verifyRes = await fetch('/api/portal/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                billId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            toast.success('Payment successful!');
            router.refresh();
          } catch (error: any) {
            toast.error(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Patient', // Can optionally pass real patient details here
        },
        theme: {
          color: '#0f172a', // Tailwind slate-900
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </>
  );
}
