'use client';

import * as Atoms from '@/atoms';
import { useMemo } from 'react';
import { parseContentForLinkEmbed } from './utils';

export type PostLinkEmbedsProps = {
  content: string;
};

export const PostLinkEmbeds = ({ content }: PostLinkEmbedsProps) => {
  const linkEmbed = useMemo(() => parseContentForLinkEmbed(content), [content]);

  if (linkEmbed.type === 'none') return null;

  return (
    <Atoms.Container>
      {linkEmbed.type === 'youtube' && (
        <iframe
          width="100%"
          height="315"
          src={linkEmbed.url}
          loading="lazy"
          title={`YouTube video ${linkEmbed.url.split('https://www.youtube-nocookie.com/embed/')[1]}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          className="rounded-md"
          data-testid="YouTube video player"
        ></iframe>
      )}
    </Atoms.Container>
  );
};
