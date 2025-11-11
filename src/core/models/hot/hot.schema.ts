import { NexusHotTag } from '@/core/services/nexus/nexus.types';

/**
 * Hot Tags Model Schema
 * Stores cached hot/trending tags with composite ID based on timeframe and reach
 */
export interface HotTagsModelSchema {
  /** Composite ID: 'timeframe:reach' (e.g., 'today:all', 'month:friends') */
  id: string;
  /** Array of hot tags */
  tags: NexusHotTag[];
  /** Timestamp when cached */
  cached_at: number;
}

// Schema for Dexie table
export const hotTagsTableSchema = '&id, cached_at';
