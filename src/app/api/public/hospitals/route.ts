import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (orgId) {
      // Fetch doctors for a specific hospital
      const doctors = await prisma.user.findMany({
        where: {
          organizationId: orgId,
          role: 'DOCTOR',
          isActive: true
        },
        select: {
          id: true,
          name: true,
          department: true,
        }
      });
      return NextResponse.json({ doctors });
    } else {
      // Fetch all active hospitals
      const hospitals = await prisma.organization.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          domain: true,
        }
      });
      return NextResponse.json({ hospitals });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
