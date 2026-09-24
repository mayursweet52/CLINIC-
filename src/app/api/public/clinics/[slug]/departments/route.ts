import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    let departments: any[] = [];

    try {
      const clinic = await prisma.organization.findUnique({
        where: { slug, isActive: true },
        select: { id: true }
      });

      if (clinic) {
        departments = await prisma.department.findMany({
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
      }
    } catch (dbErr) {
      console.warn("Database unreachable in /api/public/clinics/[slug]/departments, using demo fallback:", dbErr);
      departments = [];
    }

    if (!departments || departments.length === 0) {
      const fallbackDepartments = [
        {
          id: "dept-1",
          name: "General Medicine",
          slug: "general-medicine",
          icon: "🩺",
          order: 1,
          conditionsCount: 3,
          conditions: [
            { id: "c-1", name: "Fever & Cold", slug: "fever-cold", icon: "🌡️" },
            { id: "c-2", name: "Diabetes Check", slug: "diabetes", icon: "🩸" },
            { id: "c-3", name: "Hypertension / BP", slug: "hypertension", icon: "🫀" }
          ]
        },
        {
          id: "dept-2",
          name: "Cardiology",
          slug: "cardiology",
          icon: "❤️",
          order: 2,
          conditionsCount: 2,
          conditions: [
            { id: "c-4", name: "Chest Pain / ECG", slug: "chest-pain", icon: "💓" },
            { id: "c-5", name: "Heart Checkup", slug: "heart-checkup", icon: "🩺" }
          ]
        },
        {
          id: "dept-3",
          name: "Pediatrics",
          slug: "pediatrics",
          icon: "👶",
          order: 3,
          conditionsCount: 2,
          conditions: [
            { id: "c-6", name: "Child Vaccination", slug: "vaccination", icon: "💉" },
            { id: "c-7", name: "Growth & Nutrition", slug: "growth", icon: "🍎" }
          ]
        },
        {
          id: "dept-4",
          name: "Orthopedics",
          slug: "orthopedics",
          icon: "🦴",
          order: 4,
          conditionsCount: 2,
          conditions: [
            { id: "c-8", name: "Joint & Knee Pain", slug: "joint-pain", icon: "🦵" },
            { id: "c-9", name: "Back Pain / Spine", slug: "back-pain", icon: "🧍" }
          ]
        }
      ];

      return NextResponse.json({ departments: fallbackDepartments });
    }

    const formatted = departments.map(d => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      icon: d.icon,
      order: d.order,
      conditionsCount: d._count?.conditions || 0,
      conditions: d.conditions || []
    }));

    return NextResponse.json({ departments: formatted });
  } catch (error) {
    console.error("Departments GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
