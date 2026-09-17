import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PayStatus } from '@prisma/client';

export async function GET() {
  try {
    // Fetch all PAID invoices to calculate revenue
    const billings = await prisma.billing.findMany({
      where: {
        paymentStatus: PayStatus.PAID
      },
      include: {
        appointment: {
          include: { patient: true }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    // Map billings into 'Income' transactions for the finance dashboard
    const transactions = billings.map(bill => ({
      id: bill.id,
      date: bill.appointment?.appointmentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      description: `Invoice ${bill.invoiceNo} - ${bill.appointment?.patient?.name || 'Patient'}`,
      type: 'Income',
      amount: bill.totalAmount
    }));

    // Add a couple of dummy expenses since we don't have an Expense table yet
    transactions.push({
      id: 'exp-1',
      date: new Date().toISOString().split('T')[0],
      description: 'Medical Supplies Restock (Dummy)',
      type: 'Expense',
      amount: 350
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching finance data:', error);
    return NextResponse.json({ error: 'Failed to fetch finance data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // We can leave this as a dummy response since finance transactions aren't directly saved in a table yet
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'Transaction logged virtually', 
      transaction: {
        id: Math.random().toString(),
        date: new Date().toISOString().split('T')[0],
        description: body.description || 'Misc Transaction',
        type: body.type || 'Income',
        amount: body.amount || 0
      } 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
