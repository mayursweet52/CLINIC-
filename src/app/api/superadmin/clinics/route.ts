import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateClinicSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6).max(10),
  address: z.string().min(5),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(10),
});

async function requireSuperAdmin() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "SUPERADMIN") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET() {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true, patients: true },
        },
        users: {
          where: { role: "DOCTOR" },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const clinics = orgs.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      city: org.city,
      state: org.state,
      isActive: org.isActive,
      rating: org.rating,
      totalReviews: org.totalReviews,
      staffCount: org._count.users,
      doctorCount: org.users.length,
      patientCount: org._count.patients,
      createdAt: org.createdAt
    }));

    return NextResponse.json({ clinics });
  } catch (error) {
    console.error("Failed to fetch clinics", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = CreateClinicSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.slug }
    });
    if (existingOrg) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const randomPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          address: data.address,
          phone: data.ownerPhone,
          plan: "PRO",
          isActive: true,
          settings: { email: data.ownerEmail },
        }
      });

      const admin = await tx.user.create({
        data: {
          organizationId: org.id,
          name: data.ownerName,
          email: data.ownerEmail,
          phone: data.ownerPhone,
          passwordHash,
          role: "ADMIN"
        }
      });

      const departments = [
        { name: "General Medicine", slug: "general-medicine", icon: "🩺", order: 1 },
        { name: "Orthopedics", slug: "orthopedics", icon: "🦴", order: 2 },
        { name: "Cardiology", slug: "cardiology", icon: "❤️", order: 3 },
        { name: "Pediatrics", slug: "pediatrics", icon: "👶", order: 4 },
      ];

      const conditionsData: Record<string, any[]> = {
        "general-medicine": [
          { name: "Fever, cold, cough", slug: "fever-cold-cough", icon: "🤒", keywords: ["fever", "cold", "cough", "flu"] },
          { name: "General checkup", slug: "general-checkup", icon: "🩺", keywords: ["checkup", "routine", "annual"] },
          { name: "Diabetes follow-up", slug: "diabetes-followup", icon: "💉", keywords: ["diabetes", "sugar", "glucose"] },
        ],
        "orthopedics": [
          { name: "Knee pain", slug: "knee-pain", icon: "🦵", keywords: ["knee", "joint", "leg"] },
          { name: "Back pain", slug: "back-pain", icon: "🦴", keywords: ["back", "spine", "lumbar"] },
          { name: "Fracture", slug: "fracture", icon: "🩹", keywords: ["fracture", "broken", "bone"] },
        ],
        "cardiology": [
          { name: "Chest pain", slug: "chest-pain", icon: "💔", keywords: ["chest", "heart", "angina"] },
          { name: "High BP", slug: "high-bp", icon: "🩸", keywords: ["bp", "blood pressure", "hypertension"] },
          { name: "Heart checkup", slug: "heart-checkup", icon: "❤️", keywords: ["heart", "cardiac", "ecg"] },
        ],
        "pediatrics": [
          { name: "Vaccination", slug: "vaccination", icon: "💉", keywords: ["vaccine", "immunization"] },
          { name: "Child fever", slug: "child-fever", icon: "🤒", keywords: ["child", "baby", "fever"] },
          { name: "Growth checkup", slug: "growth-checkup", icon: "📏", keywords: ["growth", "development"] },
        ],
      };

      for (const deptData of departments) {
        const dept = await tx.department.create({
          data: {
            organizationId: org.id,
            name: deptData.name,
            slug: deptData.slug,
            icon: deptData.icon,
            order: deptData.order
          }
        });

        const conds = conditionsData[deptData.slug];
        for (const cond of conds) {
          await tx.condition.create({
            data: {
              departmentId: dept.id,
              name: cond.name,
              slug: cond.slug,
              icon: cond.icon,
              keywords: cond.keywords
            }
          });
        }
      }

      return { org, admin };
    });

    return NextResponse.json({
      success: true,
      clinic: result.org,
      owner: {
        email: data.ownerEmail,
        password: randomPassword,
        message: "Save these credentials — shown only once"
      }
    });

  } catch (error) {
    console.error("Failed to create clinic", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
