import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { eventBus } from '@/lib/events';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    logger.info({ event: event.event }, 'Received Razorpay webhook');

    if (event.event === 'payment.captured') {
      const orderId = event.payload.payment.entity.order_id;
      const paymentId = event.payload.payment.entity.id;

      if (!orderId) {
        return NextResponse.json({ success: true });
      }

      const bill = await prisma.billing.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (!bill) {
        logger.warn(`Bill not found for Razorpay Order ID: ${orderId}`);
        return NextResponse.json({ success: true }); // Acknowledge to prevent retries
      }

      if (bill.paymentStatus === 'PAID') {
        logger.info(`Bill ${bill.id} is already paid. Idempotency skip.`);
        return NextResponse.json({ success: true });
      }

      const updatedBill = await prisma.billing.update({
        where: { id: bill.id },
        data: {
          paymentStatus: 'PAID',
          razorpayPaymentId: paymentId,
          paidAt: new Date(),
        },
        include: { appointment: true }
      });

      eventBus.broadcast('bill.paid', {
        id: updatedBill.id,
        amount: updatedBill.totalAmount,
        invoiceNo: updatedBill.invoiceNo,
        patientId: updatedBill.appointment?.patientId || '',
      }, updatedBill.organizationId);

    } else if (event.event === 'payment.failed') {
      const orderId = event.payload.payment.entity.order_id;
      if (!orderId) return NextResponse.json({ success: true });

      const bill = await prisma.billing.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (bill && bill.paymentStatus !== 'PAID') {
        // We can just keep it UNPAID, but for logging purposes we can leave it or add a FAILED status
        // The enum PayStatus only has PAID, UNPAID, PARTIAL. So we'll keep UNPAID.
        logger.info(`Payment failed for Bill ${bill.id}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Webhook error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
