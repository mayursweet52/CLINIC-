import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ appointmentId: string }> }) {
  try {
    const { appointmentId } = await params;

    const appointment = await prisma.healthAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true,
        organization: true,
        review: true,
        billing: true,
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "COMPLETED" || appointment.billing?.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Visit not eligible for review" }, { status: 400 });
    }

    if (appointment.review) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
    }

    return NextResponse.json({
      eligible: true,
      doctorName: appointment.doctor?.name || "Doctor",
      patientName: appointment.patient.name.split(" ")[0],
      reason: appointment.reason,
      clinic: {
        name: appointment.organization.name,
        logoUrl: appointment.organization.logoUrl,
      }
    });

  } catch (error) {
    console.error("Feedback Check API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
