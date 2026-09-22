import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/invoice';

export async function GET(req: Request, { params }: { params: Promise<{ billId: string }> | { billId: string } }) {
  try {
    const { billId } = await Promise.resolve(params);
    const cookieStore = await cookies();
    const token = cookieStore.get('patient_token')?.value;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const { payload } = await jwtVerify(token, secret);
    const patientId = payload.userId as string;

    const bill = await prisma.billing.findFirst({
      where: {
        id: billId,
        appointment: { patientId }
      }
    });

    if (!bill) {
      return new NextResponse('Not found', { status: 404 });
    }

    const { buffer } = await generateInvoicePDF(billId);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${billId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
