// src/app/api/account/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, getDb } from '@/lib/mongodb';
import { requireSessionStrict, isSessionError } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const { ObjectId } = await import('mongodb');
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const conversationsCol = await getCollection('conversations');
    const settingsCol = await getCollection('settings');
    const filesCol = await getCollection('files');
    const usersCol = await getCollection('users');

    if (!conversationsCol || !settingsCol || !filesCol || !usersCol) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const results = await Promise.allSettled([
      conversationsCol.deleteMany({ userId }),
      settingsCol.deleteMany({ userId }),
      filesCol.deleteMany({ userId }),
    ]);

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.error('[DELETE /api/account/delete] dependent-data deletion failed:', failed);
      return NextResponse.json(
        { error: 'Failed to delete some account data. Please try again or contact support.' },
        { status: 500 }
      );
    }

    const deleteResult = await usersCol.deleteOne({ _id: userObjectId });
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const res = NextResponse.json({ success: true, message: 'Account deleted.' });
    res.cookies.set('nexus-token', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  } catch (err) {
    console.error('[DELETE /api/account/delete] error:', err);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}