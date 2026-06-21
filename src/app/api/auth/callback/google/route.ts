import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dev-secret';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`);

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('No access token');

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    // Upsert user in MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('nexus-ai');

    // ✅ FIX: capture the upserted/matched _id so we can sign it into the JWT.
    // Without this, Google-login users have no userId in their session,
    // which breaks every userId-keyed route (settings, conversations,
    // account management) added in the Settings/Account/Chat-persistence
    // upgrade — those routes have no email-fallback lookup by design.
    const result = await db.collection('users').findOneAndUpdate(
      { email: googleUser.email },
      {
        $set: {
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          googleId: googleUser.id,
          updatedAt: new Date(),
        },
        // tokenVersion lets "logout all devices" work the same way for
        // Google users as for email/password users (see src/lib/auth.ts).
        $setOnInsert: { createdAt: new Date(), provider: 'google', tokenVersion: 0 },
      },
      { upsert: true, returnDocument: 'after' }
    );
    await client.close();

    const userDoc = result; // findOneAndUpdate returns the document directly (driver v5+) or null
    const userId = userDoc?._id?.toString();

    if (!userId) {
      // Should be unreachable with upsert: true, but fail loudly rather than
      // silently issuing a userId-less token if the driver version differs.
      throw new Error('Failed to resolve user id after upsert');
    }

    // Create JWT — now includes userId, matching login/route.ts's shape.
    const token = jwt.sign(
      {
        userId,
        email: googleUser.email,
        name: googleUser.name,
        tokenVersion: userDoc?.tokenVersion ?? 0,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    res.cookies.set('nexus-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`);
  }
}