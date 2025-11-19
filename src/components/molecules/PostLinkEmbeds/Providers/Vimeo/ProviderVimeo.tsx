import * as Atoms from '@/atoms';
import * as ProviderTypes from '../Provider.types';
import * as ProviderConstants from '../Provider.constants';
import * as ProviderUtils from '../Provider.utils';

/**
 * Extract Vimeo video ID from URL
 * Vimeo uses purely numeric IDs (unlike YouTube's alphanumeric)
 */
const extractVimeoId = (url: string): string | null => {
  // Handle different Vimeo URL formats
  const patterns = [
    // Standard: vimeo.com/VIDEO_ID
    /vimeo\.com\/(\d+)/,
    // Player: player.vimeo.com/video/VIDEO_ID
    /player\.vimeo\.com\/video\/(\d+)/,
    // Channels: vimeo.com/channels/*/VIDEO_ID
    /vimeo\.com\/channels\/[^/]+\/(\d+)/,
    // Groups: vimeo.com/groups/*/videos/VIDEO_ID
    /vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
    // Album: vimeo.com/album/*/video/VIDEO_ID
    /vimeo\.com\/album\/\d+\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const id = url.match(pattern)?.[1];
    if (id && /^\d+$/.test(id)) return id;
  }

  return null;
};

/**
 * Extract timestamp from Vimeo URL
 * Vimeo uses hash fragment format: #t=XmYs or #t=Xs etc.
 */
const extractVimeoTimestamp = (url: string): number | null => {
  try {
    const parsedUrl = new URL(url);
    const timeHash = parsedUrl.hash.match(/#t=([^&\s]+)/)?.[1];
    if (!timeHash) return null;

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
