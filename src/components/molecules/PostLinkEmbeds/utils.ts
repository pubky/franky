import type { LinkEmbed } from './types';
import LinkifyIt from 'linkify-it';

const extractYouTubeId = (url: string): string | null => {
  // Handle different YouTube URL formats
  const patterns = [
    // Standard watch: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed: youtube.com/embed/* or youtube-nocookie.com/embed/*
    /(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Shorts: youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // Live streams: youtube.com/live/VIDEO_ID
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    // Old embed: youtube.com/v/VIDEO_ID (legacy)
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const id = url.match(pattern)?.[1];
    if (id?.length === 11) return id;
  }

  return null;
};

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
        const id = extractYouTubeId(url);

        if (id) {
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
