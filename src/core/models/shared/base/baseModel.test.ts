import { beforeEach, describe, expect, it } from 'vitest';
import Dexie, { Table, UpdateSpec } from 'dexie';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { ModelBase } from './baseModel';

interface TestSchema {
  id: string;
  name: string;
  count?: number;
}

class TestBaseModel extends ModelBase<string, TestSchema> implements TestSchema {
  static table: Table<TestSchema>;
  id!: string;
  name!: string;
  count?: number;

  constructor(data: TestSchema) {
    super(data);
    this.name = data.name;
    this.count = data.count;
  }
}

describe('DexieModelBase (shared CRUD/query)', () => {
  let db: Dexie;

  beforeEach(async () => {
    // Isolated in-memory IndexedDB per test
    globalThis.indexedDB = indexedDB;
    globalThis.IDBKeyRange = IDBKeyRange;

    db = new Dexie('dexie-model-base-test');
    db.version(1).stores({ base_records: 'id' });
    await db.open();

    TestBaseModel.table = db.table<TestSchema>('base_records');
    await TestBaseModel.table.clear();
  });

  it('create inserts a new record (add)', async () => {
    await TestBaseModel.create({ id: '1', name: 'alpha' });
    const stored = await TestBaseModel.table.get('1');
    expect(stored).toEqual({ id: '1', name: 'alpha' });
  });

  it('upsert inserts or replaces a record (put)', async () => {
    await TestBaseModel.upsert({ id: '2', name: 'beta', count: 1 });
    await TestBaseModel.upsert({ id: '2', name: 'beta-updated' });
    const stored = await TestBaseModel.table.get('2');
    expect(stored).toEqual({ id: '2', name: 'beta-updated' });
  });

  it('update applies partial changes and returns modified count', async () => {
    await TestBaseModel.create({ id: '3', name: 'gamma', count: 0 });
    const modified = await TestBaseModel.update('3', { count: 2 } as UpdateSpec<TestSchema>);
    expect(modified).toBe(1);
    const stored = await TestBaseModel.table.get('3');
    expect(stored).toEqual({ id: '3', name: 'gamma', count: 2 });
  });

  it('update returns 0 when record not found', async () => {
    const modified = await TestBaseModel.update('999', { name: 'missing' } as UpdateSpec<TestSchema>);
    expect(modified).toBe(0);
  });

  it('findById returns model instance or null', async () => {
    await TestBaseModel.create({ id: '4', name: 'delta' });
    const found = await TestBaseModel.findById('4');
    expect(found).toBeInstanceOf(TestBaseModel);
    expect(found?.id).toBe('4');
    expect(found?.name).toBe('delta');

    const notFound = await TestBaseModel.findById('404');
    expect(notFound).toBeNull();
  });

  it('findByIds returns only existing records (no nulls, order not guaranteed)', async () => {
    await TestBaseModel.upsert({ id: '10', name: 'a' });
    await TestBaseModel.upsert({ id: '11', name: 'b' });
    const results = await TestBaseModel.findByIds(['9', '10', '11', '12']);
    const ids = results.map((r) => r.id).sort();
    expect(ids).toEqual(['10', '11']);
  });

  it('findByIdsWithNulls preserves order and includes nulls for missing', async () => {
    await TestBaseModel.upsert({ id: '20', name: 'x' });
    await TestBaseModel.upsert({ id: '22', name: 'z' });
    const results = await TestBaseModel.findByIdsWithNulls(['20', '21', '22']);
    expect(results.length).toBe(3);
    expect(results[0]).toEqual({ id: '20', name: 'x' });
    expect(results[1]).toBeNull();
    expect(results[2]).toEqual({ id: '22', name: 'z' });
  });

  it('exists returns true/false by id', async () => {
    await TestBaseModel.create({ id: '60', name: 'exists' });
    expect(await TestBaseModel.exists('60')).toBe(true);
    expect(await TestBaseModel.exists('61')).toBe(false);
  });
});
