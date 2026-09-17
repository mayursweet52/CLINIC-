import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });

    const mappedMeds = medicines.map((m) => ({
      id: m.id,
      name: m.name,
      stock: m.stockQuantity,
      price: m.unitPrice,
    }));

    return NextResponse.json(mappedMeds);
  } catch (error) {
    console.error('Error fetching pharmacy stock:', error);
    return NextResponse.json(
      { error: 'Database error fetching pharmacy stock' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const newMed = await prisma.medicine.create({
      data: {
        organizationId: orgId,
        name: body.name || 'New Medicine',
        batchNo: `B-${Math.floor(1000 + Math.random() * 9000)}`,
        stockQuantity: Number(body.stock) || 0,
        unitPrice: Number(body.price) || 0,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    });

    return NextResponse.json(
      {
        message: 'Added successfully',
        item: {
          id: newMed.id,
          name: newMed.name,
          stock: newMed.stockQuantity,
          price: newMed.unitPrice,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
