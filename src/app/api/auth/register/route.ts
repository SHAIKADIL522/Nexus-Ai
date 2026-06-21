// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('nexus-ai');

    // ✅ FIX: TTL index — unverified accounts older than 24h auto-delete.
    // Safe to call every request; Mongo no-ops if the index already exists
    // with the same options. Requires `verified` + `createdAt` on the doc.
    await db.collection('users').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 60 * 60 * 24, partialFilterExpression: { verified: false } }
    );

    const normalizedEmail = email.toLowerCase();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.verified) {
        await client.close();
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      const hashed = await bcrypt.hash(password, 12);
      await db.collection('users').updateOne(
        { email: normalizedEmail },
        { $set: { name, password: hashed, updatedAt: new Date() } }
      );
      // ✅ FIX: backfill tokenVersion on accounts created before this
      // field existed (re-registering an unverified account hits this
      // branch, not the insert branch below). Separate call since Mongo
      // doesn't let one updateOne conditionally set a field only-if-missing
      // in the same operation as an unconditional $set on other fields.
      await db.collection('users').updateOne(
        { email: normalizedEmail, tokenVersion: { $exists: false } },
        { $set: { tokenVersion: 0 } }
      );
      await client.close();
    } else {
      const hashed = await bcrypt.hash(password, 12);
      await db.collection('users').insertOne({
        name,
        email: normalizedEmail,
        password: hashed,
        verified: false,
        // ✅ FIX: this was the actual bug. New users got no tokenVersion
        // field at all, while the Google OAuth callback route already
        // sets tokenVersion: 0 on insert. Without this, requireSessionStrict
        // in src/lib/auth.ts falls back to treating a missing value as 0
        // on both sides (token and DB) — which should still match — but
        // an explicit field removes any ambiguity and matches the Google
        // callback's behavior exactly, so both signup paths produce
        // identically-shaped user docs.
        tokenVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await client.close();
    }

    // Send OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, otp }),
    });
    const otpData = await otpRes.json();

    // ✅ FIX: propagate delivery warning instead of always claiming success.
    // Account still exists (per your choice), but the frontend now knows
    // to show a "check spam / resend" message instead of a false-positive.
    if (otpData?.success === false) {
      return NextResponse.json({
        success: true,
        message: 'Account created, but the verification email failed to send.',
        emailWarning: otpData.warning || 'Email delivery failed. Please use Resend code on the next screen.',
      });
    }

    return NextResponse.json({ success: true, message: 'Account created. Check your email for OTP.' });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}