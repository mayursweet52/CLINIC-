import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const clinic = await prisma.organization.findUnique({
      where: { slug, isActive: true },
      select: { id: true }
    });

    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const where: any = {
      organizationId: clinic.id,
      role: "DOCTOR",
      isActive: true
    };

    if (departmentId) {
      where.departments = {
        some: { departmentId }
      };
    }

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            bio: true,
            
            consultationFee: true,
            specialization: true,
          }
        },
        departments: {
          select: { department: { select: { name: true, slug: true, icon: true } } }
        }
      }
    });

    const formatted = doctors.map(d => ({
      id: d.id,
      name: d.name,
      bio: d.profile?.bio || "",
      yearsOfExperience: 10,
      averageRating: 4.8, // Static for now
      totalReviews: 10,   // Static for now
      specialization: d.profile?.specialization || "Doctor",
      consultationFee: d.profile?.consultationFee || 0,
      departments: d.departments.map(x => x.department)
    }));

    // Sort by rating desc
    formatted.sort((a, b) => b.averageRating - a.averageRating);

    return NextResponse.json({ doctors: formatted });
  } catch (error) {
    console.error("Doctors GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
