import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const clinic = await prisma.organization.findUnique({
      where: { slug, isActive: true },
      select: { id: true }
    });

    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const departments = await prisma.department.findMany({
      where: { organizationId: clinic.id, isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        order: true,
        _count: { select: { conditions: true } },
        conditions: {
          select: { id: true, name: true, slug: true, icon: true }
        }
      }
    });

    const formatted = departments.map(d => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      icon: d.icon,
      order: d.order,
      conditionsCount: d._count.conditions,
      conditions: d.conditions
    }));

    return NextResponse.json({ departments: formatted });
  } catch (error) {
    console.error("Departments GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
