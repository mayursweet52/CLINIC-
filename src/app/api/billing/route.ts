import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PayStatus } from '@prisma/client';

export async function GET() {
  try {
    const invoices = await prisma.billing.findMany({
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
      orderBy: { invoiceNo: 'desc' },
    });

    const mapped = invoices.map((inv) => ({
      id: inv.invoiceNo,
      invoiceId: inv.id,
      patientId: inv.appointment?.patient?.id,
      patient: inv.appointment?.patient?.name || 'Walk-in Patient',
      date: inv.appointment?.appointmentDate
        ? inv.appointment.appointmentDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      consultFee: inv.consultationFee,
      pharmacyFee: inv.medicineCharges,
      totalAmount: inv.totalAmount,
      discount: inv.discount,
      status:
        inv.paymentStatus === PayStatus.PAID
          ? 'Paid'
          : inv.paymentStatus === PayStatus.PARTIAL
          ? 'Partial'
          : 'Pending',
      method: inv.paymentMethod || 'Cash',
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching billing records:', error);
    return NextResponse.json(
      { error: 'Database error fetching billing records' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let appointmentId = body.appointmentId;
    if (!appointmentId) {
      const patient = await prisma.patient.findFirst();
      if (!patient) {
        return NextResponse.json(
          { error: 'No patient exists. Create a patient first.' },
          { status: 400 }
        );
      }
      const newAppt = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          appointmentDate: new Date(),
          timeSlot: 'Walk-in',
        },
      });
      appointmentId = newAppt.id;
    }

    const count = await prisma.billing.count();
    const invoiceNo = body.invoiceNo || `INV-${1001 + count}`;

    const consultFee = Number(body.consultFee ?? body.consultationFee ?? 100);
    const pharmacyFee = Number(body.pharmacyFee ?? body.medicineCharges ?? 0);
    const discount = Number(body.discount ?? 0);
    const totalAmount = Number(
      body.totalAmount ?? Math.max(0, consultFee + pharmacyFee - discount)
    );

    const statusEnum =
      body.status?.toUpperCase() === 'PAID'
        ? PayStatus.PAID
        : body.status?.toUpperCase() === 'PARTIAL'
        ? PayStatus.PARTIAL
        : PayStatus.UNPAID;

    const newInvoice = await prisma.billing.create({
      data: {
        invoiceNo,
        appointmentId,
        consultationFee: consultFee,
        medicineCharges: pharmacyFee,
        totalAmount,
        discount,
        paymentStatus: statusEnum,
        paymentMethod: body.paymentMethod || body.method || 'Cash',
      },
      include: {
        appointment: {
          include: {
            patient: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Invoice generated successfully',
        invoice: {
          id: newInvoice.invoiceNo,
          patient: newInvoice.appointment?.patient?.name || 'Patient',
          consultFee: newInvoice.consultationFee,
          pharmacyFee: newInvoice.medicineCharges,
          totalAmount: newInvoice.totalAmount,
          status: newInvoice.paymentStatus === PayStatus.PAID ? 'Paid' : 'Pending',
          method: newInvoice.paymentMethod,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 400 }
    );
  }
}
