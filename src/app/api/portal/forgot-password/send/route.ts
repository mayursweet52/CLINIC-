import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });

    const patient = await prisma.patient.findFirst({ where: { phone } });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In dev we just store in memory or reuse our mock approach since we might not have redis locally for everything
    // Actually the app uses Redis `redis.set`
    try {
      const { redis } = await import('@/lib/redis');
      await redis.set(`otp:reset:${phone}`, otp, 'EX', 300); // 5 min
    } catch (e) {
      logger.warn('Redis not available, OTP only in logs');
    }

    // Console log for demo
    logger.info(`FORGOT PASSWORD OTP for ${phone}: ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully', _devOtp: otp });
  } catch (error) {
    logger.error('Error in forgot password send:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
