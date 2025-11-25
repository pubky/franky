import { LucideProps } from 'lucide-react';
import * as Icons from './index';

/**
 * Maps a URL to the appropriate icon component based on the domain.
 *
 * @param url - The URL to parse and extract the domain from
 * @returns A Lucide icon component
 *
 * @example
 * ```ts
 * const icon = getIconFromUrl('https://github.com/user/repo');
 * // Returns Icons.Github
 *
 * const defaultIcon = getIconFromUrl('https://example.com');
 * // Returns Icons.Link (default)
 * ```
 */
export function getIconFromUrl(url: string): React.ComponentType<LucideProps> {
  try {
    // Parse the URL to extract the hostname
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Remove 'www.' prefix if present
    const domain = hostname.replace(/^www\./, '');

    // Map domains to their respective icons
    const domainIconMap: Record<string, React.ComponentType<LucideProps>> = {
      // Social Media
      'github.com': Icons.Github,
      'x.com': Icons.XTwitter,
      'twitter.com': Icons.XTwitter,
      'youtube.com': Icons.Youtube,
      'youtu.be': Icons.Youtube,
      'facebook.com': Icons.Facebook,
      'fb.com': Icons.Facebook,
      'instagram.com': Icons.Instagram,
      'linkedin.com': Icons.Linkedin,
      'reddit.com': Icons.MessageSquare, // Lucide doesn't have Reddit
      'twitch.tv': Icons.Twitch,
      'discord.com': Icons.MessageSquare, // Lucide doesn't have Discord
      'discord.gg': Icons.MessageSquare,

      // Messaging
      'telegram.org': Icons.Telegram,
      't.me': Icons.Telegram,
      'telegram.me': Icons.Telegram,
      'web.telegram.org': Icons.Telegram,
      'slack.com': Icons.Slack,
      'whatsapp.com': Icons.MessageSquare,
      'signal.org': Icons.MessageSquare,

      // Communication
      'gmail.com': Icons.Mail,
      'outlook.com': Icons.Mail,
      'mail.google.com': Icons.Mail,

      // Development
      'gitlab.com': Icons.Gitlab,
      'bitbucket.org': Icons.GitFork,
      'stackoverflow.com': Icons.MessageCircle,
      'stackexchange.com': Icons.MessageCircle,

      // Video/Streaming
      'vimeo.com': Icons.Video,
      'dailymotion.com': Icons.Video,
      'tiktok.com': Icons.Video,

      // Music
      'spotify.com': Icons.Music,
      'soundcloud.com': Icons.Music,
      'music.apple.com': Icons.Music,
      'music.youtube.com': Icons.Music,

      // Generic patterns
      // Email pattern (if it starts with mailto:)
      ...(url.startsWith('mailto:') ? { _email: Icons.Mail } : {}),
      // Phone pattern (if it starts with tel:)
      ...(url.startsWith('tel:') ? { _phone: Icons.Phone } : {}),
    };

    // Check for exact domain match
    if (domainIconMap[domain]) {
      return domainIconMap[domain];
    }

    // Check for subdomain matches (e.g., blog.example.com should match example.com)
    for (const [key, icon] of Object.entries(domainIconMap)) {
      if (domain.endsWith('.' + key)) {
        return icon;
      }
    }

    // Special URL patterns
    if (url.startsWith('mailto:')) {
      return Icons.Mail;
    }
    if (url.startsWith('tel:')) {
      return Icons.Phone;
    }

    // Default to Link icon
    return Icons.Link;
  } catch {
    // If URL parsing fails, return default Link icon
    return Icons.Link;
  }
}

/**
 * Extracts a clean label from a URL for display purposes.
 *
 * @param url - The URL to extract the label from
 * @returns A clean string label suitable for display
 *
 * @example
 * ```ts
 * getLabelFromUrl('https://github.com/user/repo');
 * // Returns 'github.com/user/repo'
 *
 * getLabelFromUrl('https://www.example.com');
 * // Returns 'example.com'
 * ```
 */
export function getLabelFromUrl(url: string): string {
  try {
    // Handle special URL schemes
    if (url.startsWith('mailto:')) {
      return url.replace('mailto:', '');
    }
    if (url.startsWith('tel:')) {
      return url.replace('tel:', '');
    }

    const urlObj = new URL(url);
    let label = urlObj.hostname.replace(/^www\./, '');

    // Add path if it's meaningful (not just '/')
    if (urlObj.pathname && urlObj.pathname !== '/') {
      label += urlObj.pathname;
    }

    return label;
  } catch {
    // If URL parsing fails, return the original URL
    return url;
  }
}
