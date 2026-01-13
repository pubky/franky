import * as ProviderTypes from '../Provider.types';
import { GenericPreview } from './GenericPreview';

/**
 * Generic embed provider
 * Implements the standard EmbedProvider interface
 * Uses client-side SWR for caching and deduplication
 */
export const Generic: ProviderTypes.EmbedProvider = {
  /**
   * This provider will support all domains not included in the others
   */
  domains: [],

  /**
   * Parse Generic URL and return embed information
   * Returns the URL immediately - fetching happens in the component with SWR
   */
  parseEmbed: (url: string): ProviderTypes.EmbedData => {
    // Just return the URL - the component will handle fetching with SWR
    return { type: 'url', value: url };
  },

  /**
   * Render Generic website preview using SWR for caching
   */
  renderEmbed: (embedData: ProviderTypes.EmbedData) => {
    // Type guard: ensure we have a URL type
    if (embedData.type !== 'url') return null;

    return <GenericPreview url={embedData.value} />;
  },
};
