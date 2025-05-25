import { type Table } from 'dexie';
import db from '@/database';
import { indexedDB } from 'fake-indexeddb';
import { DB_NAME } from '@/database/config';

/**
 * Helper to create test data for database tests
 */
export function createTestData<T extends { id?: number }>(
  table: Table<T>,
  data: Omit<T, 'id'>[]
): Promise<number[]> {
  return Promise.all(data.map(item => table.add(item as T)));
}

/**
 * Helper to clear all data from a table
 */
export function clearTable<T>(table: Table<T>): Promise<void> {
  return table.clear();
}

/**
 * Helper to reset the database (close, delete and reopen)
 */
export async function resetDatabase(): Promise<void> {
  await db.close();
  indexedDB.deleteDatabase(DB_NAME);
  await db.open();
} 