/**
 * External Links Configuration
 *
 * This file centralizes all external URLs used throughout the application.
 * URLs can be overridden using environment variables for different environments.
 */

// Pubky ecosystem links
export const PUBKY_RING_URL = process.env.NEXT_PUBLIC_PUBKY_RING_URL || 'https://pubkyring.app/';
export const PUBKY_CORE_URL = process.env.NEXT_PUBLIC_PUBKY_CORE_URL || 'https://pubky.org';

// Social media links
export const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/pubky';
export const TWITTER_GETPUBKY_URL = process.env.NEXT_PUBLIC_TWITTER_GETPUBKY_URL || 'https://x.com/getpubky';
export const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/pubky';
export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/pubky';

// Contact links
export const EMAIL_URL = process.env.NEXT_PUBLIC_EMAIL_URL || 'mailto:hello@pubky.com';

// App store links
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/app/pubky-ring/id6739356756';
export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
  'https://play.google.com/store/apps/details?id=to.pubky.ring&pcampaignid=web_share';

// Type-safe link object for easy access
export const ExternalLinks = {
  pubky: {
    ring: PUBKY_RING_URL,
    core: PUBKY_CORE_URL,
  },
  social: {
    twitter: TWITTER_URL,
    twitterGetPubky: TWITTER_GETPUBKY_URL,
    telegram: TELEGRAM_URL,
    github: GITHUB_URL,
  },
  contact: {
    email: EMAIL_URL,
  },
  stores: {
    appStore: APP_STORE_URL,
    playStore: PLAY_STORE_URL,
  },
} as const;
