import * as Atoms from '@/atoms';
import * as ProviderTypes from '../Provider.types';
import * as ProviderConstants from '../Provider.constants';
import * as ProviderUtils from '../Provider.utils';

/**
 * Extract Vimeo video ID from URL
 * Vimeo uses purely numeric IDs (unlike YouTube's alphanumeric)
 *
 * @security Regex Denial of Service (ReDoS) Prevention
 *
 * This function uses security-hardened regex patterns to prevent catastrophic
 * backtracking attacks. Key protections:
 *
 * 1. **Bounded Repetition**: Channel/group names limited to {1,100} characters
 *    instead of unbounded [^/]+ which could cause exponential backtracking
 *
 * 2. **Character Class Restrictions**: Uses [a-z0-9_-] instead of [^/] to
 *    limit valid characters and prevent edge cases
 *
 * 3. **Explicit Anchoring**: All patterns end with (?:[?#\s]|$) to ensure
 *    proper termination and prevent runaway matching
 *
 * 4. **Performance**: Guaranteed to complete in <100ms even with malicious
 *    input containing 1000+ characters (validated in tests)
 *
 * @see ProviderVimeo.test.ts - "regex catastrophic backtracking prevention"
 */
const extractVimeoId = (url: string): string | null => {
  // Handle different Vimeo URL formats with security-hardened patterns
  const patterns = [
    // Standard: vimeo.com/VIDEO_ID (with word boundary or end/query marker)
    /vimeo\.com\/(\d+)(?:[?#\s]|$)/,
    // Player: player.vimeo.com/video/VIDEO_ID
    /player\.vimeo\.com\/video\/(\d+)(?:[?#\s]|$)/,
    // Channels: vimeo.com/channels/CHANNEL_NAME/VIDEO_ID (limit channel name length)
    /vimeo\.com\/channels\/([a-z0-9_-]{1,100})\/(\d+)(?:[?#\s]|$)/i,
    // Groups: vimeo.com/groups/GROUP_NAME/videos/VIDEO_ID (limit group name length)
    /vimeo\.com\/groups\/([a-z0-9_-]{1,100})\/videos\/(\d+)(?:[?#\s]|$)/i,
    // Album: vimeo.com/album/ALBUM_ID/video/VIDEO_ID
    /vimeo\.com\/album\/(\d+)\/video\/(\d+)(?:[?#\s]|$)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // Get last capturing group (always the video ID)
      const id = match[match.length - 1];
      if (id && /^\d+$/.test(id)) return id;
    }
  }

  return null;
};

/**
 * Extract timestamp from Vimeo URL
 * Vimeo uses hash fragment format: #t=XmYs or #t=Xs or #t=X (plain seconds)
 *
 * @security Regex Precision
 * The 's' suffix is optional but explicit (not inside capture group) to prevent
 * ambiguous matches like "30ss". Each time unit (h/m/s) can appear at most once.
 * Plain numbers (e.g., "30") are treated as seconds.
 */
const extractVimeoTimestamp = (url: string): number | null => {
  try {
    const parsedUrl = new URL(url);
    const timeHash = parsedUrl.hash.match(/#t=([^&\s]+)/)?.[1];
    if (!timeHash) return null;

    // Match h/m/s format: each suffix is explicit and optional (outside capture groups)
    // Supports: "1h2m3s", "5m", "30s", or plain "30" (treated as seconds)
    // The 's?' makes seconds suffix optional, and the whole seconds group is optional via '?'
    const hmsMatch = timeHash.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
      return ProviderUtils.convertHmsToSeconds(hmsMatch[1], hmsMatch[2], hmsMatch[3]);
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Vimeo supported domains (lowercase)
 */
const VIMEO_DOMAINS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'] as const;

/**
 * Vimeo embed provider
 * Implements the standard EmbedProvider interface
 */
export const Vimeo: ProviderTypes.EmbedProvider = {
  /**
   * List of supported Vimeo domains
   */
  domains: VIMEO_DOMAINS,

  /**
   * Parse Vimeo URL and return embed information
   */
  parseEmbed: (url: string): { url: string } | null => {
    const id = extractVimeoId(url);

    if (!id) return null;

    const timestamp = extractVimeoTimestamp(url);
    const embedUrl = timestamp
      ? `https://player.vimeo.com/video/${id}#t=${timestamp}s`
      : `https://player.vimeo.com/video/${id}`;

    return { url: embedUrl };
  },

  /**
   * Render Vimeo iframe embed with responsive aspect ratio wrapper
   * Following Vimeo's official embed pattern
   */
  renderEmbed: (embedUrl: string) => {
    const videoId = embedUrl.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1] || 'id';

    return (
      <Atoms.Container data-testid="vimeo-aspect-ratio-wrapper" className="relative pt-[56.25%]">
        <Atoms.Iframe
          {...ProviderConstants.VIDEO_EMBED_PROPS}
          src={embedUrl}
          title={`Vimeo video ${videoId}`}
          data-testid="Vimeo video player"
          height="auto"
          className="absolute top-0 left-0 h-full w-full"
        />
      </Atoms.Container>
    );
  },
};
