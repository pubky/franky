import { indexedDB } from 'fake-indexeddb';
import { db } from '@/core';
import { DB_NAME } from '@/config';

export async function resetDatabase(): Promise<void> {
  await db.close();
  indexedDB.deleteDatabase(DB_NAME);
  await db.open();
}
