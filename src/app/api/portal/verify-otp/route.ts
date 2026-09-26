import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const stored = otpStore.get(phone);
    if (!stored) {
      return NextResponse.json({ error: 'No OTP requested for this number' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // Success! Clear OTP
    otpStore.delete(phone);

    // Try to find the patient
    let patient;
    try {
      patient = await prisma.patient.findFirst({ where: { phone } });
      if (!patient) {
        // Fetch first organization to use as default
        const org = await prisma.organization.findFirst();
        // Create patient if it doesn't exist
        patient = await prisma.patient.create({
          data: {
            phone,
            name: "Unknown",
            gender: "MALE", // Default fallback
            organizationId: org?.id || 'default_org',
            patientCode: `PT-${Date.now().toString().slice(-6)}`,
          }
        });
      }
    } catch {
      // DB might be down
    }

    const patientId = patient?.id || `patient_${Date.now()}`;
    const orgId = patient?.organizationId || 'default_org';

    // Issue JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const token = await new SignJWT({
      userId: patientId,
      phone,
      role: 'PATIENT',
      orgId,
      type: 'portal'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set('patient_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
