import { Pubky } from '@/core/models/models.types';

/**
 * Active Users Model Schema
 * Stores cached active users (influencers) with composite ID based on timeframe and reach
 */
export interface ActiveUsersModelSchema {
  /** Composite ID: 'timeframe:reach' (e.g., 'today:all', 'this_month:friends') */
  id: string;
  /** Array of active user IDs */
  userIds: Pubky[];
}

// Schema for Dexie table
export const activeUsersTableSchema = '&id';
