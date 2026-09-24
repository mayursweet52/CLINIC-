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

const CreateConditionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  departmentId: z.string(),
  icon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    if (!departmentId) {
      return NextResponse.json({ error: "departmentId is required" }, { status: 400 });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    if (department.organizationId !== auth.user!.orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conditions = await prisma.condition.findMany({
      where: { departmentId }
    });

    return NextResponse.json({ conditions });
  } catch (error) {
    console.error("Conditions GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const parsed = CreateConditionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { name, slug, departmentId, icon, keywords } = parsed.data;

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    if (department.organizationId !== auth.user!.orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.condition.findUnique({
      where: {
        departmentId_slug: { departmentId, slug }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Condition slug already exists in this department" }, { status: 409 });
    }

    const condition = await prisma.condition.create({
      data: {
        departmentId,
        name,
        slug,
        icon,
        keywords: keywords || []
      }
    });

    return NextResponse.json({ condition }, { status: 201 });
  } catch (error) {
    console.error("Conditions POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
