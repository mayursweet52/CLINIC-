import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("patient_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345"
    );

    const { payload } = await jose.jwtVerify(token, secret);
    const patientId = payload.patientId as string;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          include: { 
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
              }
            }, 
            visit: true,
            billing: true,
            organization: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
              }
            }
          },
          orderBy: { appointmentDate: "desc" },
          take: 20,
        },
        prescriptions: {
          include: {
            doctor: {
              select: { id: true, name: true, specialization: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        labReports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Extract bills from appointments
    const bills = (patient.appointments || [])
      .filter((a: any) => a.billing)
      .map((a: any) => a.billing);

    // Remove sensitive hash
    const { passwordHash, ...safe } = patient as any;
    return NextResponse.json({
      ...safe,
      bills,
    });
  } catch (error) {
    console.error("Portal ME API error:", error);
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
}
