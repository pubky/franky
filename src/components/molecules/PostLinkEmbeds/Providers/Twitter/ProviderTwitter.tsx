import * as Atoms from '@/atoms';
import * as ProviderTypes from '../Provider.types';
import { Tweet } from 'react-tweet';

/**
 * Extract Twitter/X post ID from URL
 * Validates that ID contains only numeric characters
 */
const extractTwitterId = (url: string): string | null => {
  // Handle different Twitter/X URL formats
  const patterns = [
    // Standard tweet: twitter.com/username/status/ID or x.com/username/status/ID
    /(?:(?:twitter|x)\.com\/[^\/]+\/status\/)(\d+)(?:[?&#\/\s]|$)/,
    // Mobile: mobile.twitter.com/username/status/ID or mobile.x.com/username/status/ID
    /(?:mobile\.(?:twitter|x)\.com\/[^\/]+\/status\/)(\d+)(?:[?&#\/\s]|$)/,
  ];

  for (const pattern of patterns) {
    const id = url.match(pattern)?.[1];
    if (id && /^\d+$/.test(id)) return id;
  }

  return null;
};

/**
 * Twitter/X supported domains (lowercase)
 */
const TWITTER_DOMAINS = [
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'mobile.twitter.com',
  'mobile.x.com',
] as const;

/**
 * Twitter/X embed provider
 * Implements the standard EmbedProvider interface
 */
export const Twitter: ProviderTypes.EmbedProvider = {
  /**
   * List of supported Twitter/X domains
   */
  domains: TWITTER_DOMAINS,

  /**
   * Parse Twitter/X URL and return embed information
   */
  parseEmbed: (url: string): ProviderTypes.EmbedData | null => {
    const id = extractTwitterId(url);

    if (!id) return null;

    return { type: 'id', value: id };
  },

  /**
   * Render Twitter/X component embed using Twitter post ID
   */
  renderEmbed: (embedData: ProviderTypes.EmbedData) => {
    // Type guard: ensure we have an ID type
    if (embedData.type !== 'id') return null;

    const tweetId = embedData.value;

    return (
      <Atoms.Container
        data-testid="twitter-container"
        data-theme="dark"
        className="mx-0 max-w-70 sm:mx-auto sm:max-w-none [&_.react-tweet-theme]:m-0"
      >
        <Tweet id={tweetId} />
      </Atoms.Container>
    );
  },
};
