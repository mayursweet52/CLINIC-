import { NextResponse } from 'next/server';

let inventory = [
  { id: 1, name: 'Paracetamol 500mg', stock: 150, price: 5 },
  { id: 2, name: 'Amoxicillin 250mg', stock: 45, price: 12 },
  { id: 3, name: 'Cough Syrup 100ml', stock: 12, price: 8 },
];

export async function GET() {
  return NextResponse.json(inventory);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = {
      id: inventory.length + 1,
      name: body.name || 'New Medicine',
      stock: body.stock || 0,
      price: body.price || 0
    };
    inventory.push(newItem);
    return NextResponse.json({ message: 'Added successfully', item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
