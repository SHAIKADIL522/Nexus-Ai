// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { requireSessionStrict, isSessionError } from '@/lib/auth';
import { SettingsDocument, defaultSettings } from '@/models/Settings';
import { UserDocument } from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId, name } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const settingsCol = await getCollection<SettingsDocument>('settings');
  if (!settingsCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    let doc = await settingsCol.findOne({ userId });

    if (!doc) {
      const seeded = defaultSettings(userId, name ?? '');
      const insertResult = await settingsCol.insertOne(seeded as SettingsDocument);
      doc = { ...seeded, _id: insertResult.insertedId };
    }

    let email = '';
    try {
      const { ObjectId } = await import('mongodb');
      const usersCol = await getCollection<UserDocument>('users');
      const userObjectId = new ObjectId(userId);
      const userDoc = await usersCol?.findOne({ _id: userObjectId });
      email = userDoc?.email ?? '';
    } catch (emailErr) {
      console.error('[GET /api/settings] failed to fetch email:', emailErr);
    }

    const { _id, ...settings } = doc;
    return NextResponse.json({ success: true, settings, email });
  } catch (err) {
    console.error('[GET /api/settings] error:', err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const settingsCol = await getCollection<SettingsDocument>('settings');
  if (!settingsCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  let body: Partial<Pick<SettingsDocument, 'profile' | 'voice' | 'model' | 'notifications' | 'theme'>>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ALLOWED_KEYS = ['profile', 'voice', 'model', 'notifications', 'theme'] as const;
  const setOps: Record<string, unknown> = { updatedAt: new Date() };

  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      setOps[key] = body[key];
    }
  }

  if (Object.keys(setOps).length === 1) {
    return NextResponse.json({ error: 'No valid settings fields provided' }, { status: 400 });
  }

  try {
    const result = await settingsCol.findOneAndUpdate(
      { userId },
      {
        $set: setOps,
        $setOnInsert: { userId, createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    const { _id, ...settings } = result;
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('[PUT /api/settings] error:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}