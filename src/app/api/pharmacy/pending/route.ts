import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/withPermission';

export const GET = withPermission('pharmacy:dispense', async (request: Request) => {
  try {
    const orgId = (request as any).user?.orgId;
    if (!orgId) return new NextResponse('Unauthorized', { status: 401 });

    const pending = await prisma.prescription.findMany({
      where: { 
        organizationId: orgId,
        status: 'PENDING'
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formatted = pending.map(rx => ({
      id: rx.id,
      patientName: rx.patient?.name || 'Unknown',
      doctorId: rx.doctorId,
      doctorName: rx.doctor?.name || 'Unknown',
      date: rx.createdAt.toISOString().split('T')[0],
      status: rx.status,
      medicines: (rx.medicines as any) || [],
      instructions: rx.instructions,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Pending Rx Fetch Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});
