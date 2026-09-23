import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const department = url.searchParams.get("department");

    const where: any = { role: "DOCTOR" };
    
    // Simple mock mapping for department IDs since they are hardcoded on frontend
    if (department === '1') where.specialization = 'General Physician';
    else if (department === '2') where.specialization = 'Orthopedic Surgeon';
    else if (department === '3') where.specialization = 'Pediatrician';

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        specialization: true,
        consultationFee: true,
      }
    });

    const mapped = doctors.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialization || 'Specialist',
      consultationFee: d.consultationFee || 1000
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
