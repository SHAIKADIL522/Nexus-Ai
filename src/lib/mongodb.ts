
import { MongoClient, Db, Collection, Document } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'nexus-ai';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}


function getClientPromise(): Promise<MongoClient> | null {
  if (!MONGODB_URI) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[MongoDB] MONGODB_URI not set — database features disabled.');
    }
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect().catch((err) => {
        // Clear the cache so the NEXT call gets a fresh connect() attempt
        // instead of permanently re-throwing this same rejection.
        console.error('[MongoDB] Initial connection failed, will retry on next request:', err);
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

 
  const client = new MongoClient(MONGODB_URI);
  return client.connect();
}

export async function getDb(): Promise<Db | null> {
  const clientPromise = getClientPromise();
  if (!clientPromise) return null;
  try {
    const c = await clientPromise;
    return c.db(DB_NAME);
  } catch (err) {
    
    console.error('[MongoDB] getDb() failed:', err);
    return null;
  }
}

export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T> | null> {
  const db = await getDb();
  return db ? db.collection<T>(name) : null;
}

export default function getMongoClientPromise(): Promise<MongoClient> | null {
  return getClientPromise();
}