'use server';

import * as ProviderTypes from './Provider.types';

/**
 * Fetches OpenGraph metadata from a URL via secure API route
 * Returns title and image if available or null
 *
 * This function delegates to /api/og-metadata which provides:
 * - DNS resolution BEFORE fetching (prevents DNS rebinding SSRF)
 * - IP validation against private ranges
 * - Real size limits via stream reading
 * - Content type validation
 *
 * @param url - The URL to fetch metadata from
 * @returns OpenGraphMetadata object or null
 * @see app/api/og-metadata/route.ts
 */
export async function fetchOpenGraphMetadata(url: string): Promise<ProviderTypes.OpenGraphMetadata | null> {
  try {
    // Basic URL validation
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Determine the API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Call the secure API route (GET for better caching)
    const searchParams = new URLSearchParams({ url });
    const response = await fetch(`${apiBaseUrl}/api/og-metadata?${searchParams.toString()}`, {
      method: 'GET',
      // Cache metadata for 1 hour to reduce load on external sites
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      // API returned an error (could be SSRF block, timeout, etc.)
      return null;
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      return null;
    }

    return {
      url: data.url || url,
      title: data.title || null,
      image: data.image || null,
    };
  } catch {
    // Return null for any errors (network, parsing, etc.)
    return null;
  }
}
