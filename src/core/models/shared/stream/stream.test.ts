import { beforeEach, describe, expect, it } from 'vitest';
import Dexie, { Table } from 'dexie';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { BaseStreamModel } from './stream';

type TestItem = string;

interface TestStreamSchema {
  id: string;
  stream: TestItem[];
}

class TestStreamModel extends BaseStreamModel<string, TestItem, TestStreamSchema> implements TestStreamSchema {
  static table: Table<TestStreamSchema>;
  id: string;
  stream: TestItem[];

  constructor(data: TestStreamSchema) {
    super(data);
    this.id = data.id;
    this.stream = data.stream;
  }
}

describe('BaseStreamModel', () => {
  let db: Dexie;

  beforeEach(async () => {
    globalThis.indexedDB = indexedDB;
    globalThis.IDBKeyRange = IDBKeyRange;

    db = new Dexie('stream-model-test');
    db.version(1).stores({ test_streams: 'id' });
    await db.open();

    TestStreamModel.table = db.table<TestStreamSchema>('test_streams');
    await TestStreamModel.table.clear();
  });

  it('create inserts a new stream (strict insert)', async () => {
    const created = await TestStreamModel.create('s1', ['a', 'b']);
    expect(created).toEqual({ id: 's1', stream: ['a', 'b'] });
    const stored = await TestStreamModel.table.get('s1');
    expect(stored).toEqual({ id: 's1', stream: ['a', 'b'] });
  });

  it('upsert inserts or replaces a stream', async () => {
    // First upsert
    const created = await TestStreamModel.upsert('s1', ['a', 'b']);
    expect(created).toEqual({ id: 's1', stream: ['a', 'b'] });

    // Second upsert on same id should replace
    const updated = await TestStreamModel.upsert('s1', ['c', 'd']);
    expect(updated).toEqual({ id: 's1', stream: ['c', 'd'] });

    const stored = await TestStreamModel.table.get('s1');
    expect(stored).toEqual({ id: 's1', stream: ['c', 'd'] });
  });

  it('findById returns model or null', async () => {
    await TestStreamModel.upsert('s2', ['x']);
    const found = await TestStreamModel.findById('s2');
    expect(found).toBeInstanceOf(TestStreamModel);
    expect(found?.id).toBe('s2');
    expect(found?.stream).toEqual(['x']);

    const missing = await TestStreamModel.findById('missing');
    expect(missing).toBeNull();
  });

  it('deleteById removes the stream', async () => {
    await TestStreamModel.upsert('s3', ['z']);
    await TestStreamModel.deleteById('s3');
    const stored = await TestStreamModel.table.get('s3');
    expect(stored).toBeUndefined();
  });
});
