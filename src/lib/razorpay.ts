import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing in environment variables');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export interface CreateOrderParams {
  amount: number; // in smallest currency unit (e.g. paise)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createOrder({ amount, currency, receipt, notes }: CreateOrderParams) {
  const razorpay = getRazorpayClient();
  
  const options = {
    amount,
    currency,
    receipt,
    notes,
  };

  const order = await razorpay.orders.create(options);
  return order;
}

export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_secret) {
    throw new Error('RAZORPAY_KEY_SECRET is missing in environment variables');
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
