import { beforeEach, describe, expect, it } from 'vitest';
import Dexie, { Table, UpdateSpec } from 'dexie';
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

  it('create inserts a new record (add)', async () => {
    await TestModel.create({ id: 1, name: 'alpha' });
    const stored = await TestModel.table.get(1);
    expect(stored).toEqual({ id: 1, name: 'alpha' });
  });

  it('upsert inserts or replaces a record (put)', async () => {
    await TestModel.upsert({ id: 2, name: 'beta', count: 1 });
    await TestModel.upsert({ id: 2, name: 'beta-updated' });
    const stored = await TestModel.table.get(2);
    expect(stored).toEqual({ id: 2, name: 'beta-updated' });
  });

  it('update applies partial changes and returns modified count', async () => {
    await TestModel.create({ id: 3, name: 'gamma', count: 0 });
    const modified = await TestModel.update(3, { count: 2 } as UpdateSpec<TestSchema>);
    expect(modified).toBe(1);
    const stored = await TestModel.table.get(3);
    expect(stored).toEqual({ id: 3, name: 'gamma', count: 2 });
  });

  it('update returns 0 when record not found', async () => {
    const modified = await TestModel.update(999, { name: 'missing' } as UpdateSpec<TestSchema>);
    expect(modified).toBe(0);
  });

  it('findById returns model instance or null', async () => {
    await TestModel.create({ id: 4, name: 'delta' });
    const found = await TestModel.findById(4);
    expect(found).toBeInstanceOf(TestModel);
    expect(found?.id).toBe(4);
    expect(found?.name).toBe('delta');

    const notFound = await TestModel.findById(404);
    expect(notFound).toBeNull();
  });

  it('findByIds returns only existing records (no nulls, order not guaranteed)', async () => {
    await TestModel.bulkSave([
      { id: 10, name: 'a' },
      { id: 11, name: 'b' },
    ]);
    const results = await TestModel.findByIds([9, 10, 11, 12]);
    const ids = results.map((r) => r.id).sort();
    expect(ids).toEqual([10, 11]);
  });

  it('findByIdsWithNulls preserves order and includes nulls for missing', async () => {
    await TestModel.bulkSave([
      { id: 20, name: 'x' },
      { id: 22, name: 'z' },
    ]);
    const results = await TestModel.findByIdsWithNulls([20, 21, 22]);
    expect(results.length).toBe(3);
    expect(results[0]).toEqual({ id: 20, name: 'x' });
    expect(results[1]).toBeNull();
    expect(results[2]).toEqual({ id: 22, name: 'z' });
  });

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

  it('exists returns true/false by id', async () => {
    await TestModel.create({ id: 60, name: 'exists' });
    expect(await TestModel.exists(60)).toBe(true);
    expect(await TestModel.exists(61)).toBe(false);
  });
});
