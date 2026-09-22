import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { verifySignature } from '@/lib/razorpay';
import { eventBus } from '@/lib/events';

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
    const { orderId, paymentId, signature, billId } = body;

    if (!orderId || !paymentId || !signature || !billId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify bill belongs to patient
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

    // Verify signature
    try {
      const isValid = verifySignature(orderId, paymentId, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // Update Billing
    const updatedBill = await prisma.billing.update({
      where: { id: billId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paidAt: new Date(),
      },
    });

    // Publish event
    eventBus.broadcast('bill.paid', {
      id: updatedBill.id,
      amount: updatedBill.totalAmount,
      invoiceNo: updatedBill.invoiceNo,
      patientId,
    }, updatedBill.organizationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
