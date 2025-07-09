import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/config/test.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // Suppress specific warnings
    onConsoleLog(log) {
      // Suppress WebAssembly warnings
      if (
        log.includes('WebAssembly.instantiateStreaming') ||
        log.includes('application/wasm') ||
        log.includes('MIME type')
      ) {
        return false;
      }
      // Suppress JSDOM navigation warnings
      if (log.includes('Not implemented: navigation')) {
        return false;
      }
      return true;
    },
    // Configure to better handle unhandled rejections
    dangerouslyIgnoreUnhandledErrors: false,
    // Silence some types of warnings in stderr
    silent: false,
  },
});
