'use server';

import * as cheerio from 'cheerio';
import * as ProviderTypes from './Provider.types';
import * as ProviderUtils from './Provider.utils';

/**
 * Fetches OpenGraph metadata from a URL
 * Returns title and image if available or null
 *
 * @param url - The URL to fetch metadata from
 * @returns OpenGraphMetadata object or null
 */
export async function fetchOpenGraphMetadata(url: string): Promise<ProviderTypes.OpenGraphMetadata | null> {
  try {
    // Validate URL format and safety
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Check if URL is safe to fetch
    if (!ProviderUtils.isUrlSafe(url)) {
      return null;
    }

    // Fetch with timeout and size limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      redirect: 'follow',
      // Cache metadata for 1 hour to reduce load on external sites
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    // Check response status
    if (!response.ok) {
      return null;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return null;
    }

    // Limit response size to prevent memory issues (5MB limit)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return null;
    }

    // Get HTML content
    const html = await response.text();

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Extract OpenGraph metadata
    const ogTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="og:title"]').attr('content') ||
      $('title').text() ||
      null;

    const ogImage =
      $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content') || null;

    // Normalize and validate image URL
    let normalizedImage: string | null = null;
    if (ogImage) {
      try {
        // Handle relative URLs by converting to absolute
        if (!ogImage.startsWith('http://') && !ogImage.startsWith('https://')) {
          const baseUrl = new URL(url);
          const absoluteUrl = new URL(ogImage, baseUrl.origin).toString();

          if (ProviderUtils.isUrlSafe(absoluteUrl)) {
            normalizedImage = absoluteUrl;
          }
        } else if (ProviderUtils.isUrlSafe(ogImage)) {
          normalizedImage = ogImage;
        }
      } catch {
        // Invalid URL format so image is null
      }
    }

    return {
      url,
      title: ogTitle ? ogTitle.trim() : null,
      image: normalizedImage,
    };
  } catch {
    // Return null for any errors (timeout, network, parsing, etc.)
    return null;
  }
}
