// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { sendWelcomeEmail } from '@/lib/sendWelcomeEmail';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('nexus-ai');

    const record = await db.collection('otps').findOne({ email: normalizedEmail });

    if (!record) {
      await client.close();
      return NextResponse.json({ error: 'No OTP found. Please request a new code.' }, { status: 400 });
    }

    if (new Date(record.expires) < new Date()) {
      await db.collection('otps').deleteMany({ email: normalizedEmail });
      await client.close();
      return NextResponse.json({ error: 'OTP expired. Please request a new code.' }, { status: 400 });
    }

    if (record.otp !== otp) {
      await client.close();
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const user = await db.collection('users').findOne({ email: normalizedEmail });

    const updateResult = await db.collection('users').updateOne(
      { email: normalizedEmail },
      { $set: { verified: true, updatedAt: new Date() } }
    );

    await db.collection('otps').deleteMany({ email: normalizedEmail });
    await client.close();

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'No account found for this email' }, { status: 404 });
    }

    // fire welcome email after verification — wrapped separately so a
    // Resend failure here never blocks the verify response; account is
    // already verified successfully at this point regardless
    try {
      await sendWelcomeEmail(normalizedEmail, user?.name || 'there');
    } catch (welcomeErr) {
      console.error('Welcome email failed (non-blocking):', welcomeErr);
    }

    return NextResponse.json({ success: true, message: 'Account verified' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
