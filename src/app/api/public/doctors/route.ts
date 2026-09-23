import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const department = url.searchParams.get("department");

    const where: any = { role: "DOCTOR" };
    
    // Simple mock mapping for department IDs since they are hardcoded on frontend
    if (department === '1') where.department = 'Cardiology';
    else if (department === '2') where.department = 'Neurology';
    else if (department === '3') where.department = 'Pediatrics';
    else if (department === '4') where.department = 'General Medicine';

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        department: true,
      }
    });

    const mapped = doctors.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.department || 'Specialist',
      consultationFee: 1000
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
