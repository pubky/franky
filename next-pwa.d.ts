declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  type CacheHandler = 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate';

  interface RuntimeCacheEntry {
    urlPattern: RegExp | string | ((params: { url: URL }) => boolean);
    handler: CacheHandler;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
        purgeOnQuotaError?: boolean;
      };
      cacheableResponse?: {
        statuses?: number[];
        headers?: Record<string, string>;
      };
      networkTimeoutSeconds?: number;
      backgroundSync?: {
        name: string;
        options?: {
          maxRetentionTime?: number;
        };
      };
      fetchOptions?: RequestInit;
      matchOptions?: CacheQueryOptions;
    };
  }

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: RuntimeCacheEntry[];
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  }

  export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
