'use client';

import { useMemo } from 'react';
import LinkifyIt from 'linkify-it';

import * as Atoms from '@/atoms';
import * as Providers from './Providers';
import * as Types from './PostLinkEmbeds.types';

// Register all embed providers here
const EMBED_PROVIDERS: Providers.EmbedProvider[] = [
  Providers.Youtube,
  // Add more providers here:
  // Providers.Vimeo,
  // Providers.Twitch,
];

// Protocol types to ignore when parsing links
const IGNORED_PROTOCOLS = ['ftp:', 'mailto:'];

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

    // Try each provider until one matches
    for (const provider of EMBED_PROVIDERS) {
      if (provider.isDomain(hostname)) {
        const embed = provider.parseEmbed(url);
        if (embed) return { embed, provider };
      }
    }

    return { embed: null, provider: null };
  } catch {
    return { embed: null, provider: null };
  }
};

export const PostLinkEmbeds = ({ content }: Types.PostLinkEmbedsProps) => {
  const { embed, provider } = useMemo(() => parseContentForLinkEmbed(content), [content]);

  if (!embed || !provider) return null;

  return <Atoms.Container>{provider.renderEmbed(embed.url)}</Atoms.Container>;
};
