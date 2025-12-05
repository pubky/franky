'use client';

import { useState, useEffect } from 'react';

export interface OgMetadata {
  url: string;
  title: string | null;
  image: string | null;
  error?: string;
}

// Simple in-memory cache for metadata
const metadataCache = new Map<
  string,
  {
    data: OgMetadata;
    timestamp: number;
  }
>();

const CACHE_TTL = 3600000; // 1 hour in milliseconds
const BATCH_DELAY_MS = 100; // Wait 100ms to accumulate URLs for batching

/**
 * Batching state for OG metadata requests.
 * Accumulates URLs from multiple hook instances and fetches them together.
 */
type OgBatchState = {
  urls: Set<string>;
  resolvers: Map<string, Array<(result: OgMetadata | null) => void>>;
  timeoutId: ReturnType<typeof setTimeout> | null;
};

let pendingBatch: OgBatchState | null = null;
const inFlightRequests = new Map<string, Promise<OgMetadata | null>>();

/**
 * Queue a URL for batch fetching.
 */
function queueUrlForBatch(url: string): Promise<OgMetadata | null> {
  // Check cache first
  const cached = metadataCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }

  // Check if already in-flight
  const existingRequest = inFlightRequests.get(url);
  if (existingRequest) {
    return existingRequest;
  }

  // Create promise for this URL
  const promise = new Promise<OgMetadata | null>((resolve) => {
    // Initialize batch if not exists
    if (!pendingBatch) {
      pendingBatch = {
        urls: new Set(),
        resolvers: new Map(),
        timeoutId: null,
      };
    }

    // Add URL to batch
    pendingBatch.urls.add(url);

    // Add resolver for this URL
    if (!pendingBatch.resolvers.has(url)) {
      pendingBatch.resolvers.set(url, []);
    }
    pendingBatch.resolvers.get(url)!.push(resolve);

    // Reset debounce timer
    if (pendingBatch.timeoutId) {
      clearTimeout(pendingBatch.timeoutId);
    }

    // Schedule batch execution
    pendingBatch.timeoutId = setTimeout(() => {
      executeBatch();
    }, BATCH_DELAY_MS);
  });

  // Register as in-flight
  inFlightRequests.set(url, promise);

  return promise;
}

/**
 * Execute the pending batch.
 */
async function executeBatch(): Promise<void> {
  if (!pendingBatch) return;

  const batch = pendingBatch;
  pendingBatch = null;

  const urls = Array.from(batch.urls);

  if (urls.length === 0) {
    return;
  }

  console.debug(`[OgMetadataBatch] Fetching ${urls.length} URLs in batch`);

  try {
    // Use POST endpoint for batch fetching
    const response = await fetch('/api/og-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      throw new Error('Batch fetch failed');
    }

    const data = (await response.json()) as { results: Record<string, OgMetadata> };

    // Resolve each URL's promise with its result
    for (const url of urls) {
      const result = data.results[url] || null;

      // Cache the result
      if (result && !result.error) {
        metadataCache.set(url, {
          data: result,
          timestamp: Date.now(),
        });
      }

      // Clean up in-flight
      inFlightRequests.delete(url);

      // Resolve all waiting promises for this URL
      const resolvers = batch.resolvers.get(url) || [];
      resolvers.forEach((resolve) => resolve(result));
    }
  } catch (error) {
    console.error('[OgMetadataBatch] Batch fetch failed:', error);

    // Resolve all with null on error
    for (const url of urls) {
      inFlightRequests.delete(url);
      const resolvers = batch.resolvers.get(url) || [];
      resolvers.forEach((resolve) => resolve(null));
    }
  }
}

/**
 * Hook to fetch OpenGraph metadata with batching and caching
 *
 * Features:
 * - Automatic batching of multiple requests (100ms debounce)
 * - In-memory caching with TTL
 * - Deduplication of concurrent requests
 * - Loading and error states
 *
 * @param url - The URL to fetch metadata for
 * @returns Metadata, loading state, and error
 *
 * @example
 * const { metadata, isLoading, error } = useOgMetadata('https://example.com');
 */
export function useOgMetadata(url: string | null) {
  const [metadata, setMetadata] = useState<OgMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setMetadata(null);
      setIsLoading(false);
      return;
    }

    // Check cache first (synchronous)
    const cached = metadataCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setMetadata(cached.data);
      setIsLoading(false);
      return;
    }

    // Fetch via batch queue
    setIsLoading(true);
    setError(null);

    queueUrlForBatch(url)
      .then((result) => {
        if (result) {
          setMetadata(result);
          if (result.error) {
            setError(new Error(result.error));
          }
        } else {
          setError(new Error('Failed to fetch metadata'));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [url]);

  return {
    metadata,
    isLoading,
    error,
  };
}

/**
 * Clear the OG metadata cache and pending batches.
 * Useful for testing.
 */
export function clearOgMetadataCache(): void {
  metadataCache.clear();
  inFlightRequests.clear();
  if (pendingBatch?.timeoutId) {
    clearTimeout(pendingBatch.timeoutId);
  }
  pendingBatch = null;
}
