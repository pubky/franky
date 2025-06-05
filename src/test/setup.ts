import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { db } from '@/core';

process.env.NEXT_PUBLIC_DB_VERSION = '1';
process.env.NEXT_PUBLIC_DEBUG_MODE = 'false';
process.env.NEXT_PUBLIC_NEXUS_URL = 'https://nexus.staging.pubky.app/v0';
process.env.NEXT_PUBLIC_SYNC_TTL = '300000';
process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL = 'http://localhost:6288/generate_signup_token';
process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD = 'admin';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
