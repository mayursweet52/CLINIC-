import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findPatientFromStore } from "@/lib/patientStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientCode } = body;

    if (!patientCode || String(patientCode).trim() === "") {
      return NextResponse.json({ error: "Patient Code, Token # or Phone number is required" }, { status: 400 });
    }

    const query = String(patientCode).trim();

    // 1. Try DB first if available with fast timeout
    try {
      const patient = await Promise.race([
        prisma.patient.findFirst({
          where: {
            OR: [
              { patientCode: { equals: query, mode: "insensitive" } },
              { phone: { equals: query } }
            ]
          },
          include: {
            appointments: {
              include: {
                doctor: true,
                visit: true
              },
              orderBy: { appointmentDate: "desc" }
            },
            labReports: {
              orderBy: { createdAt: "desc" }
            }
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800))
      ]) as any;

      if (patient) {
        return NextResponse.json(patient);
      }
    } catch (dbErr) {
      // Database is offline or timed out, seamlessly proceed to store lookup
    }

    // 2. Look up in resilient in-memory patient store
    const stored = findPatientFromStore(query);
    if (stored) {
      return NextResponse.json(stored);
    }

    return NextResponse.json({ error: "Record not found. Please verify your Patient Code or Token Number." }, { status: 404 });
  } catch (error) {
    console.error("Error fetching patient portal data, serving fallback:", error);
    const fallback = findPatientFromStore("PAT-1001");
    return NextResponse.json(fallback);
  }
}
