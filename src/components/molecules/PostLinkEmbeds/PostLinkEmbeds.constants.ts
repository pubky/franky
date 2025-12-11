import * as Providers from './Providers';

// Register all embed providers here
export const EMBED_PROVIDERS: Providers.EmbedProvider[] = [
  Providers.Youtube,
  Providers.Vimeo,
  Providers.Twitter,
  Providers.Generic,
  // Add more providers here:
  // Providers.Twitch,
];

// Protocol types to ignore when parsing links
export const IGNORED_PROTOCOLS = ['ftp:', 'mailto:'];
