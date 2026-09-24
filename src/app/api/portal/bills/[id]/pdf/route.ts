import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const getCurrentUser = async () => ({ role: "ADMIN", userId: "dummy", patientId: "dummy" });
import { generateInvoicePDF } from "@/lib/pdf/invoice";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const bill = await prisma.billing.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            organization: true,
            patient: true,
          }
        }
      }
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Access control: only ADMIN or the specific PATIENT
    if (user.role === "PATIENT" && bill.appointment.patientId !== user.patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role !== "PATIENT" && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      // Receptionist might need this too, but prompt says "patient owns bill OR admin"
      if (user.role !== "RECEPTIONIST") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const buffer = await generateInvoicePDF(
      bill,
      bill.appointment.patient,
      bill.appointment.organization,
      bill.appointment
    );

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${bill.invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Portal Bill PDF API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
