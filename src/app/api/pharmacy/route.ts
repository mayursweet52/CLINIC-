import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_MEDICINES = [
  { id: 'med-1', name: 'Paracetamol 500mg', stock: 150, stockQuantity: 150, price: 15 },
  { id: 'med-2', name: 'Amoxicillin 250mg', stock: 85, stockQuantity: 85, price: 45 },
  { id: 'med-3', name: 'Cetirizine 10mg', stock: 200, stockQuantity: 200, price: 20 },
  { id: 'med-4', name: 'Azithromycin 500mg', stock: 40, stockQuantity: 40, price: 75 },
  { id: 'med-5', name: 'Pantoprazole 40mg', stock: 120, stockQuantity: 120, price: 35 },
  { id: 'med-6', name: 'Ibuprofen 400mg', stock: 95, stockQuantity: 95, price: 25 },
];

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });

    if (medicines && medicines.length > 0) {
      const mappedMeds = medicines.map((m) => ({
        id: m.id,
        name: m.name,
        stock: m.stockQuantity,
        stockQuantity: m.stockQuantity,
        price: m.unitPrice,
      }));
      return NextResponse.json(mappedMeds);
    }

    return NextResponse.json(DEFAULT_MEDICINES);
  } catch (error) {
    console.warn('Database offline or empty in pharmacy GET, returning fallback medicines');
    return NextResponse.json(DEFAULT_MEDICINES);
  }
}

export async function POST(request: Request) {
  try {
    let orgId = request.headers.get('x-org-id');
    if (!orgId) {
      const org = await prisma.organization.findFirst().catch(() => null);
      orgId = org?.id || 'demo-org-1';
    }

    const body = await request.json();

    const newMed = await prisma.medicine.create({
      data: {
        organizationId: orgId,
        name: body.name || 'New Medicine',
        batchNo: `B-${Math.floor(1000 + Math.random() * 9000)}`,
        stockQuantity: Number(body.stock) || Number(body.stockQuantity) || 50,
        unitPrice: Number(body.price) || 20,
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
          stockQuantity: newMed.stockQuantity,
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
