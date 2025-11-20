import * as Atoms from '@/atoms';
import * as ProviderTypes from '../Provider.types';
import * as ProviderConstants from '../Provider.constants';
import * as ProviderUtils from '../Provider.utils';

/**
 * Extract YouTube video ID from URL
 * Validates that ID is exactly 11 characters with valid characters only
 */
const extractYouTubeId = (url: string): string | null => {
  // Handle different YouTube URL formats
  // Use word boundaries or specific delimiters to ensure exactly 11 characters
  const patterns = [
    // Standard watch: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(?:[&\s]|$)/,
    // Short URL: youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&\s]|$)/,
    // Embed: youtube.com/embed/* or youtube-nocookie.com/embed/*
    /(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[?&\s]|$)/,
    // Shorts: youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})(?:[?&\s]|$)/,
    // Live streams: youtube.com/live/VIDEO_ID
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})(?:[?&\s]|$)/,
    // Music subdomain: music.youtube.com/watch?v=VIDEO_ID
    /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(?:[&\s]|$)/,
    // Old embed: youtube.com/v/VIDEO_ID (legacy)
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})(?:[?&\s]|$)/,
  ];

  for (const pattern of patterns) {
    const id = url.match(pattern)?.[1];
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
  }

  return null;
};

/**
 * Extract timestamp from YouTube URL and convert to seconds
 * Supports formats: 123s, 1h2m3s, 123 (plain number)
 */
const extractYouTubeTimestamp = (url: string): number | null => {
  try {
    const parsedUrl = new URL(url);
    const timeParam = parsedUrl.searchParams.get('t');
    if (!timeParam) return null;

    // Require at least one component
    const hmsMatch = timeParam.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)$/);
    if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
      const timestamp = ProviderUtils.convertHmsToSeconds(hmsMatch[1], hmsMatch[2], hmsMatch[3]);
      // convertHmsToSeconds returns null if any value is NaN (defense in depth)
      if (timestamp !== null) return timestamp;
    }

    const numericMatch = timeParam.match(/^(\d+)s?$/);
    if (numericMatch) {
      const parsed = parseInt(numericMatch[1], 10);
      // Guard against NaN from parseInt (defense in depth)
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Extract video ID from YouTube embed URL for accessibility/debugging
 * Returns 'unknown' if extraction fails (should never happen with valid embed URLs)
 *
 * @param embedUrl - The YouTube embed URL
 * @returns The 11-character video ID or 'unknown' as fallback
 */
const extractVideoIdFromEmbedUrl = (embedUrl: string): string => {
  return embedUrl.match(/youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/)?.[1] || 'unknown';
};

/**
 * YouTube supported domains (lowercase)
 */
const YOUTUBE_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com',
  'music.youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
] as const;

/**
 * YouTube embed provider
 * Implements the standard EmbedProvider interface
 */
export const Youtube: ProviderTypes.EmbedProvider = {
  /**
   * List of supported YouTube domains
   */
  domains: YOUTUBE_DOMAINS,

  /**
   * Parse YouTube URL and return embed information
   */
  parseEmbed: (url: string): { url: string } | null => {
    const id = extractYouTubeId(url);

    if (!id) return null;

    const timestamp = extractYouTubeTimestamp(url);
    const embedUrl = timestamp
      ? `https://www.youtube-nocookie.com/embed/${id}?start=${timestamp}`
      : `https://www.youtube-nocookie.com/embed/${id}`;

    return { url: embedUrl };
  },

  /**
   * Render YouTube iframe embed with responsive aspect ratio wrapper
   * Matches Vimeo's rendering pattern for consistent 16:9 aspect ratio
   */
  renderEmbed: (embedUrl: string) => {
    const videoId = extractVideoIdFromEmbedUrl(embedUrl);

    return (
      <Atoms.Container data-testid="youtube-aspect-ratio-wrapper" className="relative pt-[56.25%]">
        <Atoms.Iframe
          {...ProviderConstants.VIDEO_EMBED_PROPS}
          src={embedUrl}
          title={`YouTube video ${videoId}`}
          data-testid="YouTube video player"
          height="auto"
          className="absolute top-0 left-0 h-full w-full"
        />
      </Atoms.Container>
    );
  },
};
