import { UserStreamTimeframe, UserStreamReach } from '@/core/services/nexus/nexus.types';

/**
 * Builds a composite active users ID from timeframe and reach parameters
 * Format: timeframe:reach
 *
 * @param timeframe - The timeframe enum value
 * @param reach - The reach enum value or 'all'
 * @returns Composite ID string (e.g., 'today:all')
 */
export const buildActiveUsersId = (timeframe: UserStreamTimeframe, reach: UserStreamReach | 'all'): string => {
  return `${timeframe}:${reach}`;
};
