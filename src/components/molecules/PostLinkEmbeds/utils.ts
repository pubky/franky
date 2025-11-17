import type { LinkEmbed } from './types';
import LinkifyIt from 'linkify-it';

export const parseContentForLinkEmbed = (content: string): LinkEmbed => {
  try {
    const linkify = new LinkifyIt();
    linkify.add('ftp:', null).add('mailto:', null);

    const match = linkify.match(content);

    if (!match) return { type: 'none', url: '' };

    const url = match[0].url;

    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    switch (hostname) {
      case 'youtube.com':
      case 'www.youtube.com':
      case 'youtu.be':
      case 'm.youtube.com':
      case 'www.youtube-nocookie.com':
      case 'youtube-nocookie.com': {
        const youtubeIdRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(youtubeIdRegex);
        const id = match?.[2];

        if (id && id.length === 11) {
          return { type: 'youtube', url: `https://www.youtube-nocookie.com/embed/${id}` };
        }
      }

      default:
        return { type: 'none', url: '' };
    }
  } catch {
    return { type: 'none', url: '' };
  }
};
