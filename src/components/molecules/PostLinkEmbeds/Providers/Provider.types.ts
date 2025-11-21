import type { ReactNode } from 'react';

/**
 * Standard interface that all embed providers must implement
 */
export interface EmbedProvider {
  /**
   * List of supported domains for this provider (lowercase)
   * Used for O(1) hostname-to-provider lookup
   */
  domains: readonly string[];

  /**
   * Parse URL and return embed information
   * Returns null if URL is not valid for this provider
   */
  parseEmbed: (url: string) => { data: string } | null;

  /**
   * Render the embed component for this provider
   */
  renderEmbed: (embedData: string) => ReactNode;
}
