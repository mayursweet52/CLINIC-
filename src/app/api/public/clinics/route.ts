import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const department = searchParams.get("department");
    const sortBy = searchParams.get("sortBy");

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } }
      ];
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (department) {
      where.departments = {
        some: { slug: department, isActive: true }
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "rating") orderBy = { rating: "desc" };
    else if (sortBy === "name") orderBy = { name: "asc" };

    const clinics = await prisma.organization.findMany({
      where,
      orderBy,
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
        _count: {
          select: {
            users: { where: { role: "DOCTOR" } },
            patients: true
          }
        },
        departments: {
          where: { isActive: true },
          select: { name: true, slug: true, icon: true },
          take: 4,
          orderBy: { order: "asc" }
        }
      }
    });

    const formattedClinics = clinics.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      city: c.city,
      state: c.state,
      address: c.address,
      pincode: c.pincode,
      phone: c.phone,
      logoUrl: c.logoUrl,
      coverImageUrl: c.coverImageUrl,
      rating: c.rating,
      totalReviews: c.totalReviews,
      doctorsCount: c._count.users,
      patientCount: c._count.patients,
      departments: c.departments,
    }));

    return NextResponse.json({ clinics: formattedClinics, total: formattedClinics.length });
  } catch (error) {
    console.error("Public Clinics GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
