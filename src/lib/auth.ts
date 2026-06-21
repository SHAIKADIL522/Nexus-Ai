
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dev-secret';

export interface SessionUser {
  userId: string;
  email: string;
  name?: string;
  tokenVersion?: number;
}

export type SessionResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

export function isSessionError(
  result: SessionResult
): result is { ok: false; response: Response } {
  return result.ok === false;
}

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get('nexus-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;

    if (!decoded || typeof decoded.email !== 'string') return null;

    return {
      userId: typeof decoded.userId === 'string' ? decoded.userId : '',
      email: decoded.email,
      name: typeof decoded.name === 'string' ? decoded.name : undefined,
      tokenVersion: typeof decoded.tokenVersion === 'number' ? decoded.tokenVersion : undefined,
    };
  } catch {
    // covers TokenExpiredError, JsonWebTokenError, malformed token, etc.
    return null;
  }
}


export function requireSession(req: NextRequest): SessionResult {
  const user = getSessionFromRequest(req);
  if (!user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { ok: true, user };
}

export async function requireSessionStrict(req: NextRequest): Promise<SessionResult> {
  const user = getSessionFromRequest(req);
  if (!user || !user.userId) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  try {
  
    const { getCollection } = await import('./mongodb');
    const { ObjectId } = await import('mongodb');
    type MinimalUser = { tokenVersion?: number };

    const usersCol = await getCollection<MinimalUser>('users');
    if (!usersCol) {
   
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: 'Database unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      };
    }

    let userObjectId;
    try {
      userObjectId = new ObjectId(user.userId);
    } catch {
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: 'Invalid session' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      };
    }

    const doc = await usersCol.findOne({ _id: userObjectId });
    if (!doc) {
    
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: 'Account not found. Please log in again.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      };
    }

    const tokenSideVersion = user.tokenVersion ?? 0;
    const dbSideVersion = doc.tokenVersion ?? 0;

    if (tokenSideVersion !== dbSideVersion) {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({ error: 'Session revoked. Please log in again.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    return { ok: true, user };
  } catch (err) {
    console.error('[requireSessionStrict] error:', err);
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Authentication check failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
}