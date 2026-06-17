/**
 * IndexedDB persistence service using the idb library.
 * Stores sessions, messages, and workspace snapshots.
 */
'use client';

import { openDB, type IDBPDatabase } from 'idb';
import type { WorkspaceSession, ChatMessage, Widget } from '@/types';

const DB_NAME = 'nexus-workspace';
const DB_VERSION = 1;

type NexusDB = {
  sessions: { key: string; value: WorkspaceSession };
  messages: { key: string; value: ChatMessage & { sessionId: string } };
  widgets: { key: string; value: Widget & { sessionId: string } };
  snapshots: { key: string; value: { id: string; name: string; data: string; createdAt: number } };
};

let dbPromise: Promise<IDBPDatabase<NexusDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<NexusDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions'))   db.createObjectStore('sessions',   { keyPath: 'id' });
        if (!db.objectStoreNames.contains('messages'))   db.createObjectStore('messages',   { keyPath: 'id' });
        if (!db.objectStoreNames.contains('widgets'))    db.createObjectStore('widgets',    { keyPath: 'id' });
        if (!db.objectStoreNames.contains('snapshots'))  db.createObjectStore('snapshots',  { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: WorkspaceSession): Promise<void> {
  const db = await getDB(); if (!db) return;
  await db.put('sessions', session);
}

export async function getSessions(): Promise<WorkspaceSession[]> {
  const db = await getDB(); if (!db) return [];
  return db.getAll('sessions');
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB(); if (!db) return;
  await db.delete('sessions', id);
}

export async function saveSnapshot(name: string, data: object): Promise<string> {
  const db = await getDB(); if (!db) return '';
  const id = crypto.randomUUID();
  await db.put('snapshots', { id, name, data: JSON.stringify(data), createdAt: Date.now() });
  return id;
}

export async function getSnapshots() {
  const db = await getDB(); if (!db) return [];
  return db.getAll('snapshots');
}
