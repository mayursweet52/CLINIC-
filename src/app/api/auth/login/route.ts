import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Since our seed file uses 'hashed_password_123' as a dummy hash,
    // we will allow login if password matches 'password123' for dummy users
    // In production, we'd only do bcrypt.compare
    const isPasswordValid = user.passwordHash === 'hashed_password_123' 
      ? password === 'password123'
      : await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT Access Token
    const alg = 'HS256';
    const token = await new jose.SignJWT({
      userId: user.id,
      role: user.role,
      orgId: user.organizationId,
      orgName: user.organization.name
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json(
      { message: 'Login successful', role: user.role },
      { status: 200 }
    );
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15 // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
