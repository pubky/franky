import { db } from '@/core';
import { DB_NAME } from '@/config';

export async function clearDatabase(): Promise<void> {
  if (!db.isOpen()) {
    await db.open();
  }

  await Promise.all(db.tables.map((table) => table.clear()));
}

export async function resetDatabase(): Promise<void> {
  const { indexedDB } = await import('fake-indexeddb');

  db.close();
  indexedDB.deleteDatabase(DB_NAME);
  await db.open();
}
