import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { createOrder } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('patient_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const { payload } = await jwtVerify(token, secret);
    const patientId = payload.userId as string;

    const body = await req.json();
    const { billId } = body;

    if (!billId) {
      return NextResponse.json({ error: 'billId is required' }, { status: 400 });
    }

    const bill = await prisma.billing.findFirst({
      where: {
        id: billId,
        appointment: {
          patientId: patientId,
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found or unauthorized' }, { status: 404 });
    }

    if (bill.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment not configured yet' }, { status: 503 });
    }

    const amountInPaise = Math.round(bill.totalAmount * 100);

    const order = await createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bill.id}`,
    });

    await prisma.billing.update({
      where: { id: bill.id },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
