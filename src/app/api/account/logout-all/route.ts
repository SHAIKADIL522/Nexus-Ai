// src/app/api/account/logout-all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { requireSession, isSessionError } from '@/lib/auth';
import { UserDocument } from '@/models/User';

export async function POST(req: NextRequest) {
  // Deliberately requireSession (lightweight), not requireSessionStrict:
  // this route IS the revocation action — requiring a tokenVersion match
  // before letting someone revoke tokenVersions is circular.
  const session = requireSession(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const usersCol = await getCollection<UserDocument>('users');
  if (!usersCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { ObjectId } = await import('mongodb');
  let userObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const result = await usersCol.findOneAndUpdate(
      { _id: userObjectId },
      {
        $inc: { tokenVersion: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const res = NextResponse.json({
      success: true,
      message: 'All sessions invalidated. You will need to log in again on every device.',
      newTokenVersion: result.tokenVersion,
    });

    res.cookies.set('nexus-token', '', { httpOnly: true, maxAge: 0, path: '/' });

    return res;
  } catch (err) {
    console.error('[POST /api/account/logout-all] error:', err);
    return NextResponse.json({ error: 'Failed to log out other devices' }, { status: 500 });
  }
}