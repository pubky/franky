import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import { isIP } from 'net';
import { truncateString, truncateMiddle, decodeHtmlEntities } from '@/libs/utils';
import { isIpSafe } from '@/libs/network';
import { OG_PATTERNS, extractFromHtml } from '@/libs/html';

/**
 * Result type for OG metadata fetching
 */
interface OgMetadataResult {
  url: string;
  title: string | null;
  image: string | null;
  error?: string;
}

/**
 * Fetches OG metadata for a single URL.
 * Extracted to be reusable by both GET (single) and POST (batch) handlers.
 */
async function fetchOgMetadataForUrl(url: string): Promise<OgMetadataResult> {
  // 1. Validate URL format
  if (!url || typeof url !== 'string') {
    return { url, title: null, image: null, error: 'Invalid URL' };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url, title: null, image: null, error: 'Malformed URL' };
  }

  // 2. Block dangerous protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { url, title: null, image: null, error: 'Invalid protocol' };
  }

  // 3. Validate hostname structure
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.trim() === '') {
    return { url, title: null, image: null, error: 'Invalid hostname' };
  }

  // 4. Validate domain structure for non-IP hostnames
  if (!isIP(hostname) && hostname !== 'localhost') {
    if (hostname.endsWith('.')) {
      return {
        url,
        title: null,
        image: null,
        error: 'Invalid hostname. Domain must include a top-level domain (TLD).',
      };
    }

    const parts = hostname.split('.');
    if (parts.length < 2) {
      return {
        url,
        title: null,
        image: null,
        error: 'Invalid hostname. Domain must include a top-level domain (TLD).',
      };
    }

    const tld = parts[parts.length - 1];
    if (!tld || tld.length < 2) {
      return {
        url,
        title: null,
        image: null,
        error: 'Invalid hostname. Top-level domain (TLD) must be at least 2 characters.',
      };
    }

    const domain = parts.slice(0, -1).join('.');
    if (!domain || domain.trim() === '') {
      return { url, title: null, image: null, error: 'Invalid hostname. Domain name cannot be empty.' };
    }
  }

  // 5. Resolve DNS and validate IP
  let resolvedIp: string;
  try {
    if (isIP(hostname)) {
      resolvedIp = hostname;
    } else {
      const addresses = await dns.resolve4(hostname);
      if (!addresses || addresses.length === 0) {
        return { url, title: null, image: null, error: 'DNS resolution failed' };
      }
      resolvedIp = addresses[0];
    }
  } catch {
    return { url, title: null, image: null, error: 'DNS resolution failed' };
  }

  // 6. Validate resolved IP
  if (!isIpSafe(resolvedIp)) {
    return { url, title: null, image: null, error: 'Blocked IP range' };
  }

  // 7. Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return { url, title: null, image: null, error: 'Request timeout' };
    }
    return { url, title: null, image: null, error: 'Fetch failed' };
  }

  clearTimeout(timeoutId);

  // 8. Validate response
  if (!response.ok) {
    return { url, title: null, image: null, error: 'Fetch failed' };
  }

  // 9. Validate content-type
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('text/html')) {
    return { url, title: null, image: null, error: 'Not HTML content' };
  }

  // 10. Read response body with size limit
  const reader = response.body?.getReader();
  if (!reader) {
    return { url, title: null, image: null, error: 'No response body' };
  }

  const MAX_SIZE = 5 * 1024 * 1024;
  let totalBytes = 0;
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_SIZE) {
        await reader.cancel();
        return { url, title: null, image: null, error: 'Response too large (max 5MB)' };
      }

      chunks.push(value);
    }
  } catch {
    return { url, title: null, image: null, error: 'Failed to read response' };
  }

  // 11. Decode HTML and extract metadata
  const html = new TextDecoder().decode(Buffer.concat(chunks));

  const ogTitle = extractFromHtml(html, OG_PATTERNS.TITLE);
  const titleTag = html.match(OG_PATTERNS.TITLE_TAG)?.[1] || null;
  const rawTitle = ogTitle || titleTag;
  const title = rawTitle ? decodeHtmlEntities(rawTitle) : null;

  const image = extractFromHtml(html, OG_PATTERNS.IMAGE);

  // 12. Normalize and validate image URL
  let normalizedImage: string | null = null;
  if (image) {
    try {
      const imageUrl = new URL(image, url);

      if (['http:', 'https:'].includes(imageUrl.protocol)) {
        const imageHostname = imageUrl.hostname.toLowerCase();
        let imageIp: string = '';

        if (isIP(imageHostname)) {
          imageIp = imageHostname;
        } else {
          try {
            const imageAddresses = await dns.resolve4(imageHostname);
            imageIp = imageAddresses[0];
          } catch {
            // DNS resolution failed for image, skip it
          }
        }

        if (imageIp && isIpSafe(imageIp)) {
          normalizedImage = imageUrl.toString();
        }
      }
    } catch {
      // Invalid image URL format
    }
  }

  return {
    url: truncateMiddle(url, 40),
    title: title ? truncateString(title.trim(), 50) : null,
    image: normalizedImage,
  };
}

/**
 * API Route for secure OpenGraph metadata fetching
 *
 * This endpoint prevents SSRF attacks via DNS rebinding by:
 * 1. Resolving DNS to IP address BEFORE fetching
 * 2. Validating the resolved IP against private ranges
 * 3. Using stream reading to enforce real size limits
 * 4. Validating content types and response headers
 *
 * GET: Single URL via query parameter (cacheable)
 * POST: Batch URLs via JSON body (max 10 URLs)
 *
 * @see docs/adr/XXXX-secure-og-metadata-fetching.md (TODO: Create ADR)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const result = await fetchOgMetadataForUrl(url);

    if (result.error) {
      // Map specific errors to appropriate HTTP status codes for GET endpoint
      const errorStatusMap: Record<string, number> = {
        'Blocked IP range': 403,
        'Request timeout': 408,
        'Response too large (max 5MB)': 413,
        'Fetch failed': 500,
        'Failed to read response': 500,
      };

      const status = errorStatusMap[result.error] || 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(
      {
        url: result.url,
        title: result.title,
        image: result.image,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('OG metadata fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST handler for batch OG metadata fetching.
 * Accepts up to 10 URLs at once and fetches them in parallel.
 *
 * @example
 * POST /api/og-metadata
 * Body: { "urls": ["https://example.com", "https://other.com"] }
 *
 * Response: {
 *   "results": {
 *     "https://example.com": { url, title, image },
 *     "https://other.com": { url, title, image, error: "..." }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body as { urls?: string[] };

    // Validate input
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid request. Expected { urls: string[] }' }, { status: 400 });
    }

    // Limit batch size
    const MAX_BATCH_SIZE = 10;
    if (urls.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} URLs` }, { status: 400 });
    }

    if (urls.length === 0) {
      return NextResponse.json({ results: {} });
    }

    // Deduplicate URLs
    const uniqueUrls = [...new Set(urls)];

    // Fetch all URLs in parallel
    const fetchPromises = uniqueUrls.map(async (url) => {
      const result = await fetchOgMetadataForUrl(url);
      return { originalUrl: url, result };
    });

    const results = await Promise.all(fetchPromises);

    // Build response map keyed by original URL
    const responseMap: Record<string, OgMetadataResult> = {};
    for (const { originalUrl, result } of results) {
      responseMap[originalUrl] = result;
    }

    return NextResponse.json(
      { results: responseMap },
      {
        headers: {
          // Shorter cache for batch requests since they're dynamic
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    console.error('OG metadata batch fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
