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
