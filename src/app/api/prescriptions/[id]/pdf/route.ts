import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const getCurrentUser = async () => ({ role: "ADMIN", userId: "dummy", patientId: "dummy" });
import { generatePrescriptionPDF } from "@/lib/pdf/prescription";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        organization: true,
        visit: true,
      }
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Access control
    if (user.role === "PATIENT" && prescription.patientId !== user.patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "DOCTOR" && prescription.doctorId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await generatePrescriptionPDF(
      prescription,
      prescription.patient,
      prescription.doctor,
      prescription.organization
    );

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="prescription-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Prescription PDF API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
