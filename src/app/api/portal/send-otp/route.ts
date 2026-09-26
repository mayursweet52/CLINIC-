import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const existing = otpStore.get(phone);
    // Allow resend after 30 seconds (expiresAt is +5 mins, so 5 - 4.5 = 0.5 mins)
    if (existing && existing.expiresAt - 4.5 * 60 * 1000 > Date.now()) {
      return NextResponse.json({ error: 'Please wait 30 seconds before requesting another OTP' }, { status: 429 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(phone, { otp, expiresAt });
    console.log(`[DEV ONLY] OTP for ${phone} is ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent', otp });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
