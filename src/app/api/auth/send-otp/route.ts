// src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req: NextRequest) {
  try {
    const { email, otp: providedOtp } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const otp = providedOtp || Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('nexus-ai');
    await db.collection('otps').deleteMany({ email: email.toLowerCase() });
    await db.collection('otps').insertOne({ email: email.toLowerCase(), otp, expires, createdAt: new Date() });
    await client.close();

    const { data, error } = await sendOtpEmail(email, otp);

    if (error) {
      console.error('Resend API rejected the email:', error);
      return NextResponse.json(
        {
          success: false,
          warning: 'Account created, but the verification email could not be delivered. This usually means the sender domain is not verified in Resend (sandbox mode only delivers to the account owner). Try the Resend code button, or verify a domain at resend.com/domains.',
          resendError: error.message || 'Unknown Resend error',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, message: 'OTP sent to email', id: data?.id });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}