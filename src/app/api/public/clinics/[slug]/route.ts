import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join(".").toUpperCase() + ".";
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    const clinic = await prisma.organization.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        address: true,
        pincode: true,
        phone: true,
        logoUrl: true,
        coverImageUrl: true,
        rating: true,
        totalReviews: true,
        departments: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: { 
            id: true, name: true, slug: true, icon: true,
            _count: { select: { doctors: true } }
          }
        },
        users: {
          where: { 
            role: "DOCTOR", 
            isActive: true 
          },
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                specialization: true,
                consultationFee: true,
                bio: true,
                
              }
            },
            departments: {
              select: { 
                department: { 
                  select: { name: true, slug: true, icon: true } 
                } 
              }
            }
          }
        }
      }
    });

    if (!clinic) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const reviews = await prisma.review.findMany({
      where: { 
        organizationId: clinic.id, 
        isPublic: true 
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: { select: { name: true } }
      }
    });

    const formattedClinic = {
      ...clinic,
      doctors: clinic.users.map(d => ({
        id: d.id,
        name: d.name,
        bio: d.profile?.bio || "",
        yearsOfExperience: 10,
        rating: 0, // Not querying reviews for doctors right now
        totalReviews: 0,
        specialization: d.profile?.specialization || "Doctor",
        consultationFee: d.profile?.consultationFee || 0,
        departments: d.departments.map(x => x.department)
      })),
      reviews: reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        patientInitials: getInitials(r.patient?.name || "Anonymous")
      }))
    };

    delete (formattedClinic as any).users; // Remove original users list

    return NextResponse.json({ clinic: formattedClinic });
  } catch (error) {
    console.error("Public Clinic GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
