import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { db } from '@/database';

// Configure test environment variables before importing env validation
process.env.NEXT_PUBLIC_DB_VERSION = '1';
process.env.NEXT_PUBLIC_DEBUG_MODE = 'false';
process.env.NEXT_PUBLIC_NEXUS_URL = 'https://nexus.staging.pubky.app/v0';
process.env.NEXT_PUBLIC_SYNC_TTL = '300000';

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
