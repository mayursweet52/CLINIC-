import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PayStatus } from '@prisma/client';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    const billings = await prisma.billing.findMany({
      where: { organizationId: org?.id },
      include: {
        appointment: {
          include: {
            patient: true
          }
        }
      }
    });

    const formattedBills = billings.map(bill => ({
      id: bill.invoiceNo,
      patient: bill.appointment?.patient?.name || 'Unknown Patient',
      date: bill.appointment?.appointmentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      consultFee: bill.consultationFee,
      pharmacyFee: bill.medicineCharges,
      status: bill.paymentStatus === PayStatus.PAID ? 'Paid' : bill.paymentStatus === PayStatus.PARTIAL ? 'Partial' : 'Pending',
      method: bill.paymentMethod || '-'
    }));

    return NextResponse.json(formattedBills);
  } catch (error) {
    console.error('Error fetching billing:', error);
    return NextResponse.json({ error: 'Failed to fetch billing' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const org = await prisma.organization.findFirst();
    
    // Auto-generate invoice number
    const count = await prisma.billing.count({ where: { organizationId: org?.id } });
    const invoiceNo = `INV-${1000 + count + 1}`;
    
    const newBill = await prisma.billing.create({
      data: {
        organizationId: org?.id as string,
        invoiceNo,
        appointmentId: body.appointmentId,
        consultationFee: body.consultFee || 100,
        medicineCharges: body.pharmacyFee || 0,
        totalAmount: (body.consultFee || 100) + (body.pharmacyFee || 0),
        paymentStatus: body.status === 'Paid' ? PayStatus.PAID : PayStatus.UNPAID,
        paymentMethod: body.method || 'Cash'
      },
      include: {
        appointment: {
          include: { patient: true }
        }
      }
    });
    
    return NextResponse.json({ 
      message: 'Invoice created successfully', 
      invoice: {
        id: newBill.invoiceNo,
        patient: newBill.appointment?.patient?.name || 'Unknown Patient',
        date: newBill.appointment?.appointmentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        consultFee: newBill.consultationFee,
        pharmacyFee: newBill.medicineCharges,
        status: newBill.paymentStatus === PayStatus.PAID ? 'Paid' : 'Pending',
        method: newBill.paymentMethod
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
