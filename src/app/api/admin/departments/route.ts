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

const CreateDepartmentSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const departments = await prisma.department.findMany({
      where: { organizationId: auth.user!.orgId as string },
      include: {
        _count: {
          select: { doctors: true, conditions: true }
        }
      },
      orderBy: { order: "asc" }
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Departments GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const parsed = CreateDepartmentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { name, slug, description, icon, order } = parsed.data;
    const orgId = auth.user!.orgId as string;

    const existing = await prisma.department.findUnique({
      where: {
        organizationId_slug: { organizationId: orgId, slug }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Department slug already exists" }, { status: 409 });
    }

    const department = await prisma.department.create({
      data: {
        organizationId: orgId,
        name,
        slug,
        description,
        icon,
        order: order || 0
      }
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("Departments POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
