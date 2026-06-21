// src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { requireSessionStrict, isSessionError } from '@/lib/auth';
import { ConversationDocument, ConversationMessage, toPublicConversation } from '@/models/Conversation';

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const { id } = await params;
  let objectId;
  try {
    const { ObjectId } = await import('mongodb');
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 });
  }

  let body: { title?: string; messages?: ConversationMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const setOps: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === 'string' && body.title.trim()) {
    setOps.title = body.title.trim();
  }
  if (Array.isArray(body.messages)) {
    setOps.messages = body.messages;
  }

  if (Object.keys(setOps).length === 1) {
    return NextResponse.json({ error: 'No valid fields provided (expected title and/or messages)' }, { status: 400 });
  }

  const convCol = await getCollection<ConversationDocument>('conversations');
  if (!convCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const result = await convCol.findOneAndUpdate(
      { _id: objectId, userId },
      { $set: setOps },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, conversation: toPublicConversation(result) });
  } catch (err) {
    console.error('[PUT /api/conversations/[id]] error:', err);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const { id } = await params;
  let objectId;
  try {
    const { ObjectId } = await import('mongodb');
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 });
  }

  const convCol = await getCollection<ConversationDocument>('conversations');
  if (!convCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const result = await convCol.deleteOne({ _id: objectId, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/conversations/[id]] error:', err);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}