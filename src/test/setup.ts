import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import db from '@/database';

// Mock environment variables
process.env.NEXT_PUBLIC_VERSION_DB = '1';
process.env.NEXT_PUBLIC_DEBUG_MODE = 'false';

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});

// Global setup/teardown
beforeAll(async () => {
  await db.initialize();
});

afterAll(async () => {
  await db.delete();
});

beforeEach(async () => {
  await db.delete();
  await db.initialize();
}); 