import { beforeEach, describe, expect, it, vi } from 'vitest';
import { indexedDB } from 'fake-indexeddb';
import Dexie from 'dexie';
import { DB_NAME, DB_VERSION } from '@/config';
import { db } from '@/core';

describe('Database Initialization', () => {
  beforeEach(async () => {
    // Delete any existing database before each test
    db.close();
    indexedDB.deleteDatabase(DB_NAME);
    // Clear all mocks
    vi.clearAllMocks();
    // Reset the verno property if it was mocked
    if (db.verno !== DB_VERSION) {
      Object.defineProperty(db, 'verno', {
        get: () => DB_VERSION,
        configurable: true,
      });
    }
  });

  it('should create new database when none exists', async () => {
    // Mock Dexie.exists to simulate no existing database
    const existsSpy = vi.spyOn(Dexie, 'exists').mockResolvedValue(false);
    const openSpy = vi.spyOn(db, 'open');

    await db.initialize();

    expect(existsSpy).toHaveBeenCalledWith(DB_NAME);
    expect(openSpy).toHaveBeenCalled();
    expect(db.verno).toBe(DB_VERSION);
  });

  it('should recreate database when version mismatches', async () => {
    // Mock the version number to simulate a mismatch
    const mockVerno = DB_VERSION - 1;
    Object.defineProperty(db, 'verno', {
      get: () => mockVerno,
      configurable: true,
    });

    // Mock Dexie.exists to simulate existing database
    const existsSpy = vi.spyOn(Dexie, 'exists').mockResolvedValue(true);
    const deleteSpy = vi.spyOn(db, 'delete');
    const openSpy = vi.spyOn(db, 'open');

    await db.initialize();

    expect(existsSpy).toHaveBeenCalledWith(DB_NAME);
    expect(deleteSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should not modify database when version matches', async () => {
    // Mock Dexie.exists to simulate existing database
    const existsSpy = vi.spyOn(Dexie, 'exists').mockResolvedValue(true);
    const deleteSpy = vi.spyOn(db, 'delete');
    const openSpy = vi.spyOn(db, 'open');

    await db.initialize();

    expect(existsSpy).toHaveBeenCalledWith(DB_NAME);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(db.verno).toBe(DB_VERSION);
  });
});
