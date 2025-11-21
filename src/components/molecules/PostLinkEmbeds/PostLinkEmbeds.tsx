'use client';

import { useMemo } from 'react';
import LinkifyIt from 'linkify-it';

import * as Atoms from '@/atoms';
import * as Providers from './Providers';
import * as Types from './PostLinkEmbeds.types';

// Register all embed providers here
const EMBED_PROVIDERS: Providers.EmbedProvider[] = [
  Providers.Youtube,
  Providers.Vimeo,
  Providers.Twitter,
  // Add more providers here:
  // Providers.Twitch,
];

// Protocol types to ignore when parsing links
const IGNORED_PROTOCOLS = ['ftp:', 'mailto:'];

/**
 * Create a hostname-to-provider lookup map for O(1) performance
 * Lazily initialized on first use to avoid module circular dependency issues
 */
let PROVIDER_MAP: Map<string, Providers.EmbedProvider> | null = null;

const getProviderMap = (): Map<string, Providers.EmbedProvider> => {
  if (!PROVIDER_MAP) {
    PROVIDER_MAP = new Map<string, Providers.EmbedProvider>(
      EMBED_PROVIDERS.flatMap((provider) => provider.domains.map((domain) => [domain, provider] as const)),
    );
  }
  return PROVIDER_MAP;
};

/**
 * Parse content for embeddable links
 * Returns the first embeddable link and its provider
 */
const parseContentForLinkEmbed = (content: string): Types.ParseContentForLinkEmbedResult => {
  try {
    const linkify = new LinkifyIt();

    // Disable unwanted protocol types
    IGNORED_PROTOCOLS.forEach((protocol) => linkify.add(protocol, null));

    const match = linkify.match(content);

    if (!match) return { embed: null, provider: null };

    const url = match[0].url;
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // O(1) lookup using the provider map
    const providerMap = getProviderMap();
    const provider = providerMap.get(hostname);
    if (!provider) return { embed: null, provider: null };

    const embed = provider.parseEmbed(url);
    if (!embed) return { embed: null, provider: null };

    return { embed, provider };
  } catch {
    return { embed: null, provider: null };
  }
};

export const PostLinkEmbeds = ({ content }: Types.PostLinkEmbedsProps) => {
  const { embed, provider } = useMemo(() => parseContentForLinkEmbed(content), [content]);

  if (!embed || !provider) return null;

  return <Atoms.Container>{provider.renderEmbed(embed)}</Atoms.Container>;
};
