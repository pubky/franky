import { beforeEach, describe, expect, it } from 'vitest';
import Dexie, { Table } from 'dexie';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { RecordModelBase } from './baseRecord';

interface TestSchema {
  id: number;
  name: string;
  count?: number;
}

class TestModel extends RecordModelBase<number, TestSchema> implements TestSchema {
  static table: Table<TestSchema>;
  id!: number;
  name!: string;
  count?: number;

  constructor(data: TestSchema) {
    super(data);
    this.name = data.name;
    this.count = data.count;
  }
}

describe('RecordModelBase', () => {
  let db: Dexie;

  beforeEach(async () => {
    // Setup isolated in-memory IndexedDB per test
    globalThis.indexedDB = indexedDB;
    globalThis.IDBKeyRange = IDBKeyRange;

    db = new Dexie('record-model-base-test');
    db.version(1).stores({ test_records: 'id' });
    await db.open();

    TestModel.table = db.table<TestSchema>('test_records');
    await TestModel.table.clear();
  });

  // Keep only bulkSave coverage here; shared CRUD is tested in baseModel.test.ts
  it('bulkSave upserts multiple records', async () => {
    await TestModel.bulkSave([
      { id: 40, name: 'first' },
      { id: 41, name: 'second' },
    ]);
    await TestModel.bulkSave([
      { id: 41, name: 'second-updated' },
      { id: 42, name: 'third' },
    ]);
    const all = await TestModel.table.toArray();
    const byId = new Map(all.map((r) => [r.id, r]));
    expect(byId.get(40)).toEqual({ id: 40, name: 'first' });
    expect(byId.get(41)).toEqual({ id: 41, name: 'second-updated' });
    expect(byId.get(42)).toEqual({ id: 42, name: 'third' });
  });
});
