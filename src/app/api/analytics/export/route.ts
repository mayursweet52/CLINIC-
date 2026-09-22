import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/withPermission';

function getStartDate(range: string) {
  const now = new Date();
  switch (range) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case '30d':
    default:
      now.setDate(now.getDate() - 30);
      break;
  }
  now.setHours(0, 0, 0, 0);
  return now;
}

export const GET = withPermission('analytics:read', async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const orgId = (request as any).user?.orgId;

    if (!orgId) return new NextResponse('Unauthorized', { status: 401 });

    const startDate = getStartDate(range);
    const whereOrg = { organizationId: orgId };
    
    const bills = await prisma.billing.findMany({
      where: { ...whereOrg, createdAt: { gte: startDate }, paymentStatus: 'PAID' },
      select: { invoiceNo: true, totalAmount: true, paymentMethod: true, paidAt: true, createdAt: true, appointment: { select: { patient: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Generate simple CSV
    const headers = ['Invoice No', 'Date', 'Patient Name', 'Amount', 'Payment Method'];
    const rows = bills.map(b => [
      b.invoiceNo,
      (b.paidAt || b.createdAt).toISOString().split('T')[0],
      b.appointment?.patient?.name || 'Unknown',
      b.totalAmount.toString(),
      b.paymentMethod || 'cash'
    ]);
    
    const csvContent = [headers.join(',')]
      .concat(rows.map(r => r.join(',')))
      .join('\n');
      
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-export-${range}.csv"`
      }
    });

  } catch (error) {
    console.error("Analytics Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});
