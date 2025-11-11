import { Timeframe, Reach } from '@/core/models/shared';
import { HotTagsModelSchema } from './hot.schema';
import { NexusHotTag } from '@/core/services/nexus/nexus.types';

/**
 * Builds a composite hot tags ID from timeframe and reach parameters
 * Format: timeframe:reach
 *
 * @param timeframe - The timeframe enum value
 * @param reach - The reach enum value
 * @returns Composite ID string (e.g., 'today:all')
 */
export const buildHotTagsId = (timeframe: Timeframe, reach: Reach): string => {
  return `${timeframe}:${reach}`;
};

/**
 * Creates a default hot tags model schema
 * @param id - Composite ID (timeframe:reach)
 * @param tags - Array of hot tags
 */
export const createDefaultHotTags = (id: string, tags: NexusHotTag[] = []): HotTagsModelSchema => {
  return {
    id,
    tags,
    cached_at: Date.now(),
  };
};
