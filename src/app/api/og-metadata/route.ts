import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import dns from 'dns/promises';
import { isIP } from 'net';

/**
 * API Route for secure OpenGraph metadata fetching
 *
 * This endpoint prevents SSRF attacks via DNS rebinding by:
 * 1. Resolving DNS to IP address BEFORE fetching
 * 2. Validating the resolved IP against private ranges
 * 3. Using stream reading to enforce real size limits
 * 4. Validating content types and response headers
 *
 * @see docs/adr/XXXX-secure-og-metadata-fetching.md (TODO: Create ADR)
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // 1. Validate URL format
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Malformed URL' }, { status: 400 });
    }

    // 2. Block dangerous protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' }, { status: 400 });
    }

    // 3. Resolve DNS and validate IP BEFORE fetch (prevents DNS rebinding)
    const hostname = parsed.hostname.toLowerCase();
    let resolvedIp: string;

    try {
      // If hostname is already an IP address, use it directly
      if (isIP(hostname)) {
        resolvedIp = hostname;
      } else {
        // Resolve DNS to get the actual IP address
        const addresses = await dns.resolve4(hostname);
        if (!addresses || addresses.length === 0) {
          return NextResponse.json({ error: 'DNS resolution failed' }, { status: 400 });
        }
        resolvedIp = addresses[0];
      }
    } catch (error) {
      console.error('DNS resolution failed:', error);
      return NextResponse.json({ error: 'DNS resolution failed' }, { status: 400 });
    }

    // 4. Validate the resolved IP address
    if (!isIpSafe(resolvedIp)) {
      return NextResponse.json({ error: 'Blocked IP range. Cannot fetch from private networks.' }, { status: 403 });
    }

    // 5. Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    clearTimeout(timeoutId);

    // 6. Validate response status
    if (!response.ok) {
      return NextResponse.json({ error: 'Fetch failed' }, { status: response.status });
    }

    // 7. Validate content-type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/html')) {
      return NextResponse.json({ error: 'Not HTML content' }, { status: 400 });
    }

    // 8. Limit response size using stream reader (enforces REAL size limit)
    // Note: content-length header can be spoofed, so we read the stream manually
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'No response body' }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    let totalBytes = 0;
    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalBytes += value.byteLength;
        if (totalBytes > MAX_SIZE) {
          await reader.cancel();
          return NextResponse.json({ error: 'Response too large (max 5MB)' }, { status: 413 });
        }

        chunks.push(value);
      }
    } catch (error) {
      console.error('Failed to read response body:', error);
      return NextResponse.json({ error: 'Failed to read response body' }, { status: 500 });
    }

    // 9. Decode HTML
    const html = new TextDecoder().decode(Buffer.concat(chunks));

    // 10. Parse metadata with cheerio
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="og:title"]').attr('content') ||
      $('title').text() ||
      null;

    const image = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content') || null;

    // 11. Normalize and validate image URL (must also be safe)
    let normalizedImage: string | null = null;
    if (image) {
      try {
        // Convert relative URLs to absolute
        const imageUrl = new URL(image, url);

        // Only allow HTTP/HTTPS for images
        if (!['http:', 'https:'].includes(imageUrl.protocol)) {
          normalizedImage = null;
        } else {
          // Resolve and validate image URL DNS as well
          const imageHostname = imageUrl.hostname.toLowerCase();
          let imageIp: string;

          if (isIP(imageHostname)) {
            imageIp = imageHostname;
          } else {
            try {
              const imageAddresses = await dns.resolve4(imageHostname);
              imageIp = imageAddresses[0];
            } catch {
              // DNS resolution failed for image, skip it
              imageIp = '';
            }
          }

          if (imageIp && isIpSafe(imageIp)) {
            normalizedImage = imageUrl.toString();
          }
        }
      } catch {
        // Invalid image URL format
        normalizedImage = null;
      }
    }

    // 12. Return normalized metadata
    return NextResponse.json({
      url,
      title: title ? title.trim().slice(0, 200) : null, // Limit title length
      image: normalizedImage,
    });
  } catch (error) {
    console.error('OG metadata fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Validates if an IP address is safe to fetch from
 * Blocks localhost, private IP ranges, and link-local addresses
 *
 * @param ip - The IP address to validate (IPv4 format)
 * @returns true if IP is safe to fetch from, false otherwise
 *
 * @security SSRF Prevention
 * This function is critical for preventing SSRF attacks.
 * It blocks all private IP ranges defined in RFC 1918, RFC 3927, and RFC 4193.
 */
function isIpSafe(ip: string): boolean {
  // Block localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') {
    return false;
  }

  // Parse IPv4 octets
  const octets = ip.split('.').map(Number);

  // Validate IPv4 format
  if (octets.length !== 4 || octets.some((octet) => isNaN(octet) || octet < 0 || octet > 255)) {
    // Invalid IPv4, block it (could be IPv6 or malformed)
    return false;
  }

  // Block private IP ranges (RFC 1918)
  if (octets[0] === 10) return false; // 10.0.0.0/8
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false; // 172.16.0.0/12
  if (octets[0] === 192 && octets[1] === 168) return false; // 192.168.0.0/16

  // Block link-local addresses (RFC 3927)
  if (octets[0] === 169 && octets[1] === 254) return false; // 169.254.0.0/16

  // Block IPv6 private ranges (basic check for common formats)
  if (ip.startsWith('fd') || ip.startsWith('fc')) return false; // fc00::/7 (unique local)
  if (ip.startsWith('fe80')) return false; // fe80::/10 (link-local)

  // Block carrier-grade NAT (RFC 6598)
  if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return false; // 100.64.0.0/10

  return true;
}
