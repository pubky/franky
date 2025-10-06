import { beforeEach, describe, expect, it } from 'vitest';
import Dexie, { Table, UpdateSpec } from 'dexie';
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

  it('create inserts a new record (add)', async () => {
    await TestTupleModel.create({ id: '1', value: 'alpha' });
    const stored = await TestTupleModel.table.get('1');
    expect(stored).toEqual({ id: '1', value: 'alpha' });
  });

  it('upsert inserts or replaces a record (put)', async () => {
    await TestTupleModel.upsert({ id: '2', value: 'beta', count: 1 });
    await TestTupleModel.upsert({ id: '2', value: 'beta-updated' });
    const stored = await TestTupleModel.table.get('2');
    expect(stored).toEqual({ id: '2', value: 'beta-updated' });
  });

  it('update applies partial changes', async () => {
    await TestTupleModel.create({ id: '3', value: 'gamma', count: 0 });
    await TestTupleModel.update('3', { count: 2 } as UpdateSpec<TestTupleSchema>);
    const stored = await TestTupleModel.table.get('3');
    expect(stored).toEqual({ id: '3', value: 'gamma', count: 2 });
  });

  it('findById returns model instance or null', async () => {
    await TestTupleModel.create({ id: '4', value: 'delta' });
    const found = await TestTupleModel.findById('4');
    expect(found).toBeInstanceOf(TestTupleModel);
    expect(found?.id).toBe('4');
    expect(found?.value).toBe('delta');

    const notFound = await TestTupleModel.findById('404');
    expect(notFound).toBeNull();
  });

  it('findByIds returns only existing records (no nulls)', async () => {
    await TestTupleModel.bulkSave([
      ['10', { value: 'a' }],
      ['11', { value: 'b' }],
    ]);
    const results = await TestTupleModel.findByIds(['9', '10', '11', '12']);
    const ids = results.map((r) => r.id).sort();
    expect(ids).toEqual(['10', '11']);
  });

  it('findByIdsWithNulls preserves order and includes nulls for missing', async () => {
    await TestTupleModel.bulkSave([
      ['20', { value: 'x' }],
      ['22', { value: 'z' }],
    ]);
    const results = await TestTupleModel.findByIdsWithNulls(['20', '21', '22']);
    expect(results.length).toBe(3);
    expect(results[0]).toEqual({ id: '20', value: 'x' });
    expect(results[1]).toBeNull();
    expect(results[2]).toEqual({ id: '22', value: 'z' });
  });

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

  it('exists returns true/false by id', async () => {
    await TestTupleModel.create({ id: '60', value: 'exists' });
    expect(await TestTupleModel.exists('60')).toBe(true);
    expect(await TestTupleModel.exists('61')).toBe(false);
  });
});
