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
    await client.close();

    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = jwt.sign({ userId: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
    res.cookies.set('nexus-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}