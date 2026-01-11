import type { AvatarGroupItem } from '../AvatarGroup/AvatarGroup.types';
import type { UserConnectionData } from '@/hooks/useProfileConnections/useProfileConnections.types';

/**
 * Transforms user connections into avatar group items.
 * Limits to first N items and maps to AvatarGroupItem format.
 *
 * @param connections - Array of user connection data
 * @param limit - Maximum number of avatars to include (default: 3)
 * @returns Array of avatar group items
 */
export function transformConnectionsToAvatarItems(connections: UserConnectionData[], limit = 3): AvatarGroupItem[] {
  return connections.slice(0, limit).map((connection) => ({
    id: connection.id,
    name: connection.name,
    avatarUrl: connection.avatarUrl || undefined,
  }));
}

/**
 * Normalizes stats value to handle NaN and edge cases.
 * Uses connections count as fallback if stats is 0 but connections exist.
 *
 * @param statsValue - Stats value from useProfileStats (always number type)
 * @param connectionsCount - Current count of loaded connections
 * @returns Normalized number value
 */
export function normalizeStatsValue(statsValue: number, connectionsCount: number): number {
  // Handle NaN edge case (shouldn't happen but defensive check)
  const validStatsValue = isNaN(statsValue) ? 0 : statsValue;
  // If stats is 0 but we have connections loaded, use connections count as minimum
  return validStatsValue > 0 ? validStatsValue : Math.max(validStatsValue, connectionsCount);
}
