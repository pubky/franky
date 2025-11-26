'use client';

import React from 'react';
import LinkifyIt from 'linkify-it';

import * as Atoms from '@/atoms';
import * as Providers from './Providers';
import * as Types from './PostLinkEmbeds.types';

// Register all embed providers here
const EMBED_PROVIDERS: Providers.EmbedProvider[] = [
  Providers.Youtube,
  Providers.Vimeo,
  Providers.Twitter,
  Providers.Generic,
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
 * Parse content for URLs
 * Returns the first URL
 */
const parseContentForUrl = (content: string) => {
  const linkify = new LinkifyIt();

  // Disable unwanted protocol types
  IGNORED_PROTOCOLS.forEach((protocol) => linkify.add(protocol, null));

  const match = linkify.match(content);

  return match?.[0].url;
};

/**
 * Parse URL for embeddable links
 * Returns the first embeddable link and its provider
 */
const parseUrlForLinkEmbed = async (url: string): Promise<Types.ParseUrlForLinkEmbedResult> => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // O(1) lookup using the provider map
    const providerMap = getProviderMap();
    const provider = providerMap.get(hostname);

    if (!provider) {
      const embed = await Providers.Generic.parseEmbed(url);
      return { embed, provider: Providers.Generic };
    }

    const embed = await provider.parseEmbed(url);

    if (!embed) {
      const embed = await Providers.Generic.parseEmbed(url);
      return { embed, provider: Providers.Generic };
    }

    return { embed, provider };
  } catch {
    return { embed: null, provider: null };
  }
};

export const PostLinkEmbeds = ({ content }: Types.PostLinkEmbedsProps) => {
  const [embed, setEmbed] = React.useState<Types.ParseUrlForLinkEmbedResult['embed']>(null);
  const [provider, setProvider] = React.useState<Types.ParseUrlForLinkEmbedResult['provider']>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const getLinkEmbed = async () => {
      const url = parseContentForUrl(content);
      if (!url) return;

      setIsLoading(true);
      const result = await parseUrlForLinkEmbed(url);
      if (!cancelled) {
        setEmbed(result.embed);
        setProvider(result.provider);
        setIsLoading(false);
      }
    };

    getLinkEmbed();

    return () => {
      cancelled = true;
    };
  }, [content]);

  if (isLoading) return <Atoms.Skeleton className="h-37 w-full" />;

  if (!embed || !provider) return null;

  return (
    <Atoms.Container className="w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {provider.renderEmbed(embed)}
    </Atoms.Container>
  );
};
