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

export async function POST(req: Request) {
  const auth = await requireDoctor();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    
    // Ensure we have visit
    let visitId = body.visitId;
    if (!visitId && body.appointmentId) {
      const visit = await prisma.patientVisit.findFirst({
        where: { appointmentId: body.appointmentId }
      });
      if (visit) visitId = visit.id;
    }

    const rx = await prisma.prescription.create({
      data: {
        organizationId: auth.user!.orgId as string,
        patientId: body.patientId,
        doctorId: auth.user!.userId as string,
        visitId: visitId,
        medicines: body.medicines || [],
        diet: body.diet,
        instructions: body.instructions,
      }
    });

    return NextResponse.json({ prescription: rx });
  } catch (error) {
    console.error("Prescriptions POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
