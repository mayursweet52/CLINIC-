import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

// Health Check Endpoint
export async function GET() {
  try {
    // Verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", message: "System is healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error("Health check failed", error);
    return NextResponse.json({ status: "error", message: "Database offline" }, { status: 503 });
  }
}

// Patient Portal Endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientCode } = body;

    if (!patientCode || String(patientCode).trim() === "") {
      return NextResponse.json({ error: "Patient Code, Token # or Phone number is required" }, { status: 400 });
    }

    const query = String(patientCode).trim();

    const patient = await prisma.patient.findFirst({
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
    });

    if (patient) {
      return NextResponse.json(patient);
    }

    return NextResponse.json({ error: "Record not found. Please verify your Patient Code or Token Number." }, { status: 404 });
  } catch (error) {
    logger.error("Error fetching patient portal data", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

