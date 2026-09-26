import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "ADMIN") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

const AssignDoctorsSchema = z.object({
  doctorIds: z.array(z.string()),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id: departmentId } = await params;
    const body = await req.json();
    const parsed = AssignDoctorsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { doctorIds } = parsed.data;

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department || department.organizationId !== auth.user!.orgId) {
      return NextResponse.json({ error: "Department not found or forbidden" }, { status: 404 });
    }

    // First delete all existing associations for this department
    await prisma.doctorDepartment.deleteMany({
      where: { departmentId }
    });

    // Then create new ones
    if (doctorIds.length > 0) {
      await prisma.doctorDepartment.createMany({
        data: doctorIds.map(doctorId => ({
          doctorId,
          departmentId
        }))
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Assign Doctors POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
