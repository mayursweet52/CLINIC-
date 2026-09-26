import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/withPermission';

export const GET = withPermission('pharmacy:inventory', async (request: Request) => {
  try {
    const orgId = (request as any).user?.orgId;
    if (!orgId) return new NextResponse('Unauthorized', { status: 401 });

    const inventory = await prisma.medicine.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' }
    });
    
    // Map to expected format
    const data = inventory.map(item => ({
      id: item.id,
      name: item.name,
      batch: item.batchNo,
      qty: item.stockQuantity,
      price: item.unitPrice,
      expiry: item.expiryDate.toISOString().split('T')[0],
      status: item.stockQuantity > item.reorderThreshold ? 'In Stock' : item.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock'
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Inventory Fetch Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});

export const POST = withPermission('pharmacy:inventory', async (request: Request) => {
  try {
    const orgId = (request as any).user?.orgId;
    if (!orgId) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    
    const medicine = await prisma.medicine.create({
      data: {
        organizationId: orgId,
        name: body.name,
        batchNo: body.batch || 'DEFAULT',
        stockQuantity: body.qty || 0,
        unitPrice: body.price || 0,
        expiryDate: new Date(body.expiry || new Date().setFullYear(new Date().getFullYear() + 1)),
        reorderThreshold: 50,
      }
    });

    return NextResponse.json(medicine);
  } catch (error) {
    console.error("Inventory Create Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});
