// src/app/api/account/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/mongodb';
import { requireSessionStrict, isSessionError } from '@/lib/auth';
import { UserDocument } from '@/models/User';

export async function POST(req: NextRequest) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
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
    const user = await usersCol.findOne({ _id: userObjectId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses Google Sign-In and has no password to change.' },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await usersCol.updateOne(
      { _id: userObjectId },
      { $set: { password: newHash, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[POST /api/account/change-password] error:', err);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}