import { beforeEach, describe, expect, it } from 'vitest';
import Dexie, { Table } from 'dexie';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { TupleModelBase } from './baseTuple';

interface TestTupleSchema {
  id: string;
  value: string;
  count?: number;
}

type TestTuple = [id: string, data: Omit<TestTupleSchema, 'id'>];

class TestTupleModel extends TupleModelBase<string, TestTupleSchema> implements TestTupleSchema {
  static table: Table<TestTupleSchema>;
  id!: string;
  value!: string;
  count?: number;

  constructor(data: TestTupleSchema) {
    super(data);
    this.value = data.value;
    this.count = data.count;
  }

  static toSchema(tuple: TestTuple): TestTupleSchema {
    const [id, data] = tuple;
    return { id, ...data };
  }
}

describe('TupleModelBase', () => {
  let db: Dexie;

  beforeEach(async () => {
    // Setup isolated in-memory IndexedDB per test
    globalThis.indexedDB = indexedDB;
    globalThis.IDBKeyRange = IDBKeyRange;

    db = new Dexie('tuple-model-base-test');
    db.version(1).stores({ test_tuples: 'id' });
    await db.open();

    TestTupleModel.table = db.table<TestTupleSchema>('test_tuples');
    await TestTupleModel.table.clear();
  });

  // Keep only bulkSave-specific coverage; shared CRUD lives in baseModel.test.ts
  it('bulkSave converts tuples via toSchema and upserts', async () => {
    await TestTupleModel.bulkSave([
      ['40', { value: 'first' }],
      ['41', { value: 'second' }],
    ]);
    await TestTupleModel.bulkSave([
      ['41', { value: 'second-updated' }],
      ['42', { value: 'third' }],
    ]);
    const all = await TestTupleModel.table.toArray();
    const byId = new Map(all.map((r) => [r.id, r]));
    expect(byId.get('40')).toEqual({ id: '40', value: 'first' });
    expect(byId.get('41')).toEqual({ id: '41', value: 'second-updated' });
    expect(byId.get('42')).toEqual({ id: '42', value: 'third' });
  });
});
