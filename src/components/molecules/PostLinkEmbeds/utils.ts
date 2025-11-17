import type { LinkEmbed } from './types';

export const parseContentForLinkEmbed = (content: string): LinkEmbed => {
  try {
    // Simple URL pattern for social media links
    const urlRegex =
      /(https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+)|(?:www\.)?([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(?:\/[^\s]*)*/g;

    const match = content.match(urlRegex);

    if (!match) return { type: 'none', url: '' };

    // Clean up trailing punctuation
    const url = match[0].replace(/[.,;!?]+$/, '');

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsedUrl = new URL(fullUrl);
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
