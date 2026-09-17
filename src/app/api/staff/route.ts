import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const staffMembers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    const mapped = staffMembers.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      department: s.department || 'General',
      email: s.email,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json(
      { error: 'Database error fetching staff' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const roleEnum =
      body.role?.toUpperCase() === 'DOCTOR'
        ? Role.DOCTOR
        : body.role?.toUpperCase() === 'ADMIN'
        ? Role.ADMIN
        : body.role?.toUpperCase() === 'PHARMACIST'
        ? Role.PHARMACIST
        : Role.RECEPTIONIST;

    const email = body.email || `staff-${Date.now()}@clinic.local`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: body.name,
        role: roleEnum,
        department: body.department,
      },
      create: {
        name: body.name || 'New Staff Member',
        email,
        passwordHash: body.password || 'default_secret_hash',
        role: roleEnum,
        department: body.department || null,
        phone: body.phone || null,
      },
    });

    return NextResponse.json(
      { message: 'Staff created or updated successfully', staff: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in staff route:', error);
    return NextResponse.json({ error: 'Failed to process staff request' }, { status: 400 });
  }
}
