import { NextResponse } from 'next/server';

const transactions = [
  { id: 1, date: 'Today', description: 'Patient Consultation (John Doe)', type: 'Income', amount: 150 },
  { id: 2, date: 'Today', description: 'Pharmacy Sale (Paracetamol)', type: 'Income', amount: 10 },
  { id: 3, date: 'Yesterday', description: 'Medical Supplies Restock', type: 'Expense', amount: 350 },
  { id: 4, date: 'Yesterday', description: 'Patient Consultation (Jane Roe)', type: 'Income', amount: 150 },
];

export async function GET() {
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTx = {
      id: transactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      description: body.description || 'Misc Transaction',
      type: body.type || 'Income',
      amount: body.amount || 0
    };
    transactions.push(newTx);
    return NextResponse.json({ message: 'Transaction logged', transaction: newTx }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
