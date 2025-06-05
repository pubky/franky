import { type Table } from 'dexie';
import { indexedDB } from 'fake-indexeddb';
import { db } from '@/core';
import { DB_NAME } from '@/config';

export function createTestData<T extends { id?: number }>(table: Table<T>, data: Omit<T, 'id'>[]): Promise<number[]> {
  return Promise.all(data.map((item) => table.add(item as T)));
}

export function clearTable<T>(table: Table<T>): Promise<void> {
  return table.clear();
}

export async function resetDatabase(): Promise<void> {
  await db.close();
  indexedDB.deleteDatabase(DB_NAME);
  await db.open();
}
