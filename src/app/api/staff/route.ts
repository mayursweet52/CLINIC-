import logger from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { logAction } from '@/lib/audit';
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { withPermission } from '@/lib/withPermission';

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export const GET = withPermission('user:manage', async () => {
  try {
    const org = await prisma.organization.findFirst();
    const staffMembers = await prisma.user.findMany({
      where: { organizationId: org?.id },
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
    logger.error('Error fetching staff members:', error);
    return NextResponse.json(
      { error: 'Database error fetching staff' },
      { status: 500 }
    );
  }
});

export const POST = withPermission('user:manage', async (request: Request) => {
  try {
    const body = await request.json();
    const org = await prisma.organization.findFirst();

    const roleEnum =
      body.role?.toUpperCase() === 'DOCTOR'
        ? Role.DOCTOR
        : body.role?.toUpperCase() === 'ADMIN'
        ? Role.ADMIN
        : body.role?.toUpperCase() === 'PHARMACIST'
        ? Role.PHARMACIST
        : Role.RECEPTIONIST;

    const email = body.email || `staff-${Date.now()}@clinic.local`;

    const before = await prisma.user.findUnique({ where: { email } });

    const userObj = await prisma.user.upsert({
      where: { email },
      update: {
        name: body.name,
        role: roleEnum,
        department: body.department,
      },
      create: {
        organizationId: org?.id as string,
        name: body.name || 'New Staff Member',
        email,
        passwordHash: body.password || 'default_secret_hash',
        role: roleEnum,
        department: body.department || null,
        phone: body.phone || null,
      },
    });

    const user = await getUser();

    logAction({
      userId: (user?.userId as string) || 'system',
      orgId: (user?.orgId as string) || userObj.organizationId!,
      action: before ? 'UPDATE' : 'CREATE',
      resource: 'Staff',
      resourceId: userObj.id,
      before,
      after: userObj,
      req: request
    });

    return NextResponse.json(
      { message: 'Staff created or updated successfully', staff: userObj },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in staff route:', error);
    return NextResponse.json({ error: 'Failed to process staff request' }, { status: 400 });
  }
});

