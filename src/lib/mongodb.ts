/**
 * MongoDB Atlas connection singleton.
 * Reuses the connection across hot-reloads in development.
 * Gracefully no-ops when MONGODB_URI is not set.
 */
import { MongoClient, Db, Collection, Document } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI ?? '';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

if (MONGODB_URI) {
  if (process.env.NODE_ENV === 'development') {
    // Reuse across HMR reloads in dev
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
} else {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[MongoDB] MONGODB_URI not set — database features disabled.');
  }
}

export async function getDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const c = await clientPromise;
    return c.db('nexus_ai');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    return null;
  }
}

export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T> | null> {
  const db = await getDb();
  return db ? db.collection<T>(name) : null;
}

export default clientPromise;
