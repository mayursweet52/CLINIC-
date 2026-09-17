import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });
    
    // Map Prisma models to the UI expectations
    const mappedMeds = medicines.map(m => ({
      id: m.id,
      name: m.name,
      stock: m.stockQuantity,
      price: m.unitPrice,
    }));
    
    return NextResponse.json(mappedMeds);
  } catch (error) {
    return NextResponse.json({ error: 'Database error fetching pharmacy stock' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newMed = await prisma.medicine.create({
      data: {
        name: body.name || 'New Medicine',
        batchNo: `B-${Math.floor(Math.random() * 10000)}`,
        stockQuantity: body.stock || 0,
        unitPrice: body.price || 0,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
      }
    });
    
    return NextResponse.json({ 
      message: 'Added successfully', 
      item: { id: newMed.id, name: newMed.name, stock: newMed.stockQuantity, price: newMed.unitPrice } 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
