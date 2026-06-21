// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dev-secret-change-in-prod';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('nexus-ai');
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      await client.close();
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await client.close();
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ✅ FIX: accounts created before tokenVersion existed (register/route.ts
    // didn't set it until this patch) have no tokenVersion field at all.
    // Backfill it here at login time too, not just in register, so
    // existing pre-patch accounts get a real field on next login rather
    // than relying solely on the `?? 0` fallback in requireSessionStrict.
    // Belt-and-suspenders: the fallback alone SHOULD be sufficient (0 ===
    // 0 either way), but an explicit field removes any doubt and matches
    // what every other code path now assumes is present.
    let tokenVersion: number = typeof user.tokenVersion === 'number' ? user.tokenVersion : 0;
    if (typeof user.tokenVersion !== 'number') {
      await db.collection('users').updateOne(
        { _id: user._id, tokenVersion: { $exists: false } },
        { $set: { tokenVersion: 0 } }
      );
    }

    await client.close();

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name, tokenVersion },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
    res.cookies.set('nexus-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}