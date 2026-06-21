// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { requireSessionStrict, isSessionError } from '@/lib/auth';
import { ConversationDocument, ConversationMessage, toPublicConversation } from '@/models/Conversation';

export async function GET(req: NextRequest) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  const convCol = await getCollection<ConversationDocument>('conversations');
  if (!convCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const docs = await convCol.find({ userId }).sort({ updatedAt: -1 }).toArray();
    const conversations = docs.map(toPublicConversation);
    return NextResponse.json({ success: true, conversations });
  } catch (err) {
    console.error('[GET /api/conversations] error:', err);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSessionStrict(req);
  if (isSessionError(session)) return session.response;
  const { userId } = session.user;

  if (!userId) {
    return NextResponse.json({ error: 'Invalid session: missing userId' }, { status: 401 });
  }

  let body: { title?: string; messages?: ConversationMessage[] };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const convCol = await getCollection<ConversationDocument>('conversations');
  if (!convCol) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const now = new Date();
  const doc: ConversationDocument = {
    userId,
    title: body.title?.trim() || 'New conversation',
    messages: Array.isArray(body.messages) ? body.messages : [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await convCol.insertOne(doc);
    return NextResponse.json({
      success: true,
      conversation: toPublicConversation({ ...doc, _id: result.insertedId }),
    });
  } catch (err) {
    console.error('[POST /api/conversations] error:', err);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}