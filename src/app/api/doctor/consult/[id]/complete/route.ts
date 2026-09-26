import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

async function requireDoctor() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "DOCTOR" && payload.role !== "SUPERADMIN" && payload.role !== "ADMIN") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireDoctor();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id: appointmentId } = await params;
    const body = await req.json();

    const appointment = await prisma.healthAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

    // Update appointment status
    const updatedApt = await prisma.healthAppointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED" }
    });

    // Create billing record automatically
    const consultationFee = body.consultationFee || 500; // default fee
    
    // Check if billing already exists to avoid duplicates
    let billing = await prisma.billing.findUnique({
      where: { appointmentId }
    });

    if (!billing) {
      billing = await prisma.billing.create({
        data: {
          organizationId: appointment.organizationId,
          appointmentId: appointment.id,
          invoiceNo: `INV-${Date.now()}`,
          consultationFee: consultationFee,
          totalAmount: consultationFee,
          paymentStatus: "UNPAID"
        }
      });
    }

    // You could also publish event here if using Realtime events
    
    return NextResponse.json({ success: true, appointment: updatedApt, billing });
  } catch (error) {
    console.error("Consult Complete POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
