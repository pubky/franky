import { type Table } from 'dexie';

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