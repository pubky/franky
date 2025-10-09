import { beforeEach, describe, expect, it, vi } from 'vitest';
import { indexedDB } from 'fake-indexeddb';
import { DB_NAME, DB_VERSION } from '@/config';
import { AppDatabase } from '@/core';
import * as Libs from '@/libs';

const waitForDatabaseDeletion = async (name: string, onBlocked?: () => void) => {
  await new Promise<void>((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(name);

    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error ?? new Error('Failed to delete database'));
    deleteRequest.onblocked = () => {
      onBlocked?.();
    };
  });
};

const openNativeDatabase = async (
  name: string,
  options: { version?: number; upgrade?: (database: IDBDatabase) => void } = {},
) => {
  await new Promise<void>((resolve, reject) => {
    const request = options.version ? indexedDB.open(name, options.version) : indexedDB.open(name);

    request.onupgradeneeded = () => {
      options.upgrade?.(request.result);
    };

    request.onsuccess = () => {
      request.result.close();
      resolve();
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open native database'));
    };
  });
};

const readNativeDatabaseVersion = async (name: string) =>
  new Promise<number>((resolve, reject) => {
    const request = indexedDB.open(name);

    request.onsuccess = () => {
      const { version } = request.result;
      request.result.close();
      resolve(typeof version === 'number' ? version : NaN);
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to read native database version'));
    };
  });

const readNativeObjectStoreNames = async (name: string) =>
  new Promise<string[]>((resolve, reject) => {
    const request = indexedDB.open(name);

    request.onsuccess = () => {
      const { objectStoreNames } = request.result;
      const names = Array.from({ length: objectStoreNames.length }, (_, index) => objectStoreNames.item(index) ?? '');
      request.result.close();
      resolve(names);
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to read native object stores'));
    };
  });

describe('Database Initialization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('prevents the manual version mismatch reproduction steps from persisting', async () => {
    const reproductionDbName = `${DB_NAME}-manual-mismatch-test`;
    const reproductionDb = new AppDatabase(reproductionDbName);

    await waitForDatabaseDeletion(reproductionDbName, () => reproductionDb.close());

    const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info');

    // Step 1 & 2 from the reproduction: sign in and observe the current version.
    await reproductionDb.initialize();
    const baselineVersion = await readNativeDatabaseVersion(reproductionDbName);
    expect(baselineVersion).toBeGreaterThan(0);

    // Step 3: delete an entry by creating and then removing a record.
    await reproductionDb.transaction('rw', reproductionDb.user_counts, async () => {
      const insertedId = await reproductionDb.user_counts.put({
        id: 'repro-user',
        tagged: 0,
        tags: 0,
        unique_tags: 0,
        posts: 0,
        replies: 0,
        following: 0,
        followers: 0,
        friends: 0,
        bookmarks: 0,
      });

      await reproductionDb.user_counts.delete(insertedId);
    });

    // Step 4: sign out closes Dexie connections.
    reproductionDb.close();

    // Step 5: manually open the database with a different version and legacy store.
    const mismatchedVersion = baselineVersion + 68;
    await openNativeDatabase(reproductionDbName, {
      version: mismatchedVersion,
      upgrade: (nativeDb) => {
        if (!nativeDb.objectStoreNames.contains('legacy_store')) {
          nativeDb
            .createObjectStore('legacy_store', { keyPath: 'id', autoIncrement: true })
            .add({ value: 'legacy-record' });
        }
      },
    });

    const injectedVersion = await readNativeDatabaseVersion(reproductionDbName);
    expect(injectedVersion).toBe(mismatchedVersion);

    // Step 6: signing in again should detect and recover from the mismatch.
    await reproductionDb.initialize();

    const mismatchLog = loggerInfoSpy.mock.calls.find(
      ([message]) => typeof message === 'string' && message.startsWith('Database version mismatch'),
    );

    expect(mismatchLog?.[0]).toBe(`Database version mismatch. Current: ${injectedVersion}, Expected: ${DB_VERSION}`);

    expect(reproductionDb.verno).toBe(DB_VERSION);

    const storeNames = await readNativeObjectStoreNames(reproductionDbName);
    expect(storeNames).not.toContain('legacy_store');

    const restoredNativeVersion = await readNativeDatabaseVersion(reproductionDbName);
    expect(restoredNativeVersion).toBe(baselineVersion);

    loggerInfoSpy.mockRestore();
    await reproductionDb.delete();
  });
});
