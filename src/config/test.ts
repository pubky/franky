import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { db } from '@/core';

// Suppress specific WebAssembly and navigation warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  // Suppress WebAssembly errors
  if (
    message.includes('WebAssembly') ||
    message.includes('application/wasm') ||
    message.includes('MIME type') ||
    message.includes('Not implemented: navigation')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  // Suppress WebAssembly warnings
  if (message.includes('WebAssembly') || message.includes('application/wasm') || message.includes('MIME type')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Capture unhandled rejections of WebAssembly
process.on('unhandledRejection', (reason) => {
  const reasonStr = String(reason);
  // Suppress only WebAssembly errors
  if (reasonStr.includes('WebAssembly') || reasonStr.includes('expected 4 bytes, fell off end')) {
    return; // Suppress this specific type of error
  }
  // Re-throw other errors to not mask real problems
  throw reason;
});

// Mock global fetch to prevent undici errors
global.fetch = vi.fn().mockResolvedValue(
  new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),
);

process.env.NEXT_PUBLIC_DB_VERSION = '1';
process.env.NEXT_PUBLIC_DEBUG_MODE = 'false';
process.env.NEXT_PUBLIC_NEXUS_URL = 'https://nexus.staging.pubky.app/v0';
process.env.NEXT_PUBLIC_SYNC_TTL = '300000';
process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL = 'http://localhost:6288/generate_signup_token';
process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD = 'admin';
process.env.NEXT_PUBLIC_TESTNET = 'true';
process.env.NEXT_PUBLIC_PKARR_RELAYS = 'http://localhost:8080';
process.env.NEXT_PUBLIC_HOMESERVER = 'test-homeserver-key';

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
