import { openDB, type IDBPDatabase } from 'idb';
import type { CacheEntry } from '../shared/types';
import { CACHE_DB_NAME, CACHE_STORE_NAME } from '../shared/constants';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(CACHE_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME);
        }
      },
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

export async function cacheGet(key: string): Promise<CacheEntry | undefined> {
  const db = await getDB();
  return db.get(CACHE_STORE_NAME, key);
}

export async function cacheSet(key: string, entry: CacheEntry): Promise<void> {
  const db = await getDB();
  await db.put(CACHE_STORE_NAME, entry, key);
}

export async function cacheClear(): Promise<void> {
  const db = await getDB();
  await db.clear(CACHE_STORE_NAME);
}

export async function cacheGetBulk(keys: string[]): Promise<Map<string, CacheEntry>> {
  const db = await getDB();
  const entries = await Promise.all(keys.map((k) => db.get(CACHE_STORE_NAME, k)));
  const result = new Map<string, CacheEntry>();
  for (let i = 0; i < keys.length; i++) {
    if (entries[i]) result.set(keys[i], entries[i]);
  }
  return result;
}

export async function cacheSetBulk(entries: Map<string, CacheEntry>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
  for (const [key, entry] of entries) {
    await tx.store.put(entry, key);
  }
  await tx.done;
}
