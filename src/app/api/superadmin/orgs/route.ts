import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            appointments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const org = await prisma.organization.create({
      data: {
          name: body.name,
          slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
        domain: body.domain,
        address: body.address,
        city: body.city,
        state: body.state,
        phone: body.phone,
      }
    });
    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create organization" }, { status: 400 });
  }
}

