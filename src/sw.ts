/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkFirst, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API caching for Nexus
    {
      matcher: ({ url }) => /^https:\/\/nexus\..*\.pubky\.app\/.*$/i.test(url.href),
      handler: new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes
          }),
        ],
      }),
    },
    // Use default caching strategies for everything else
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
