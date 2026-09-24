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

const UpdateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        doctors: {
          include: {
            doctor: {
              select: { 
                id: true, 
                name: true, 
                email: true, 
                
                profile: { select: { specialization: true } }
              }
            }
          }
        },
        conditions: true
      }
    });

    if (!department) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (department.organizationId !== auth.user!.orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ department });
  } catch (error) {
    console.error("Department GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const existing = await prisma.department.findUnique({ where: { id } });
    
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.organizationId !== auth.user!.orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateDepartmentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.department.update({
      where: { id },
      data: parsed.data
    });

    return NextResponse.json({ department: updated });
  } catch (error) {
    console.error("Department PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const existing = await prisma.department.findUnique({ where: { id } });
    
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.organizationId !== auth.user!.orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.department.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Department DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
