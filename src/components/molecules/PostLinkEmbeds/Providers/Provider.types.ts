import type { ReactNode } from 'react';

/**
 * Standard interface that all embed providers must implement
 */
export interface EmbedProvider {
  /**
   * Check if the hostname belongs to this provider's domain
   */
  isDomain: (hostname: string) => boolean;

  /**
   * Parse URL and return embed information
   * Returns null if URL is not valid for this provider
   */
  parseEmbed: (url: string) => { url: string } | null;

  /**
   * Render the embed component for this provider
   */
  renderEmbed: (embedUrl: string) => ReactNode;
}
