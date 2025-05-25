import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Mock environment variables
process.env.NEXT_PUBLIC_VERSION_DB = '1';
process.env.NEXT_PUBLIC_DEBUG_MODE = 'false';

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});

// Global setup/teardown
beforeAll(() => {
  // Add any global setup here
});

afterAll(() => {
  // Add any global cleanup here
}); 