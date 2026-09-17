import { NextResponse } from 'next/server';

export async function GET() {
  const invoices = [
    { id: 'INV-1001', patientId: 1, amount: 150, status: 'Paid', date: '2026-09-16' },
    { id: 'INV-1002', patientId: 2, amount: 200, status: 'Unpaid', date: '2026-09-17' },
  ];
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'Invoice generated successfully', invoice: body }, { status: 201 });
}
