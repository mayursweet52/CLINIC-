import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TxType } from '@prisma/client';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });

    const mapped = transactions.map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString().split('T')[0],
      description: tx.description,
      type: tx.type === TxType.EXPENSE ? 'Expense' : 'Income',
      amount: tx.amount,
      category: tx.category,
      paymentMode: tx.paymentMode,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Database error fetching transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const typeEnum =
      body.type?.toUpperCase() === 'EXPENSE' ? TxType.EXPENSE : TxType.INCOME;

    const newTx = await prisma.transaction.create({
      data: {
        description: body.description || 'Misc Transaction',
        type: typeEnum,
        amount: Number(body.amount) || 0,
        category: body.category || (typeEnum === TxType.EXPENSE ? 'Expense' : 'Consultation'),
        paymentMode: body.paymentMode || 'Cash',
        date: body.date ? new Date(body.date) : new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Transaction logged',
        transaction: {
          id: newTx.id,
          date: newTx.date.toISOString().split('T')[0],
          description: newTx.description,
          type: newTx.type === TxType.EXPENSE ? 'Expense' : 'Income',
          amount: newTx.amount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging transaction:', error);
    return NextResponse.json({ error: 'Invalid body or failed to create transaction' }, { status: 400 });
  }
}
