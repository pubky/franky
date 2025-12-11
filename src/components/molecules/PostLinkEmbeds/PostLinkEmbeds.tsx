'use client';

import React from 'react';
import LinkifyIt from 'linkify-it';

import * as Atoms from '@/atoms';
import * as Providers from './Providers';
import * as Types from './PostLinkEmbeds.types';
import { EMBED_PROVIDERS, IGNORED_PROTOCOLS } from './PostLinkEmbeds.constants';

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
const parseContentForUrl = (content: string): string | undefined => {
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

export const PostLinkEmbeds = ({ content }: Types.PostLinkEmbedsProps): React.ReactElement | null => {
  const [embed, setEmbed] = React.useState<Types.ParseUrlForLinkEmbedResult['embed']>(null);
  const [provider, setProvider] = React.useState<Types.ParseUrlForLinkEmbedResult['provider']>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const getLinkEmbed = async (): Promise<void> => {
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

  if (isLoading) {
    return (
      <Atoms.Typography size="sm" className="text-muted-foreground">
        Loading preview...
      </Atoms.Typography>
    );
  }

  if (!embed || !provider) return null;

  return (
    <Atoms.Container className="w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {provider.renderEmbed(embed)}
    </Atoms.Container>
  );
};
