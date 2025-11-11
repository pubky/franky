import { Pubky } from '@/core';
import { UserStreamModelSchema } from './userStream.schema';
import { UserStreamTypes } from './userStream.types';

export const USER_STREAM_ID_DELIMITER = ':' as const;

/**
 * Parts of a user stream composite ID
 */
export type UserStreamIdParts = {
  userId: Pubky;
  streamType: string; // 'followers', 'following', 'friends', etc.
};

/**
 * Build a composite ID for user stream storage in IndexedDB
 * Format: userId:streamType
 *
 * @example
 * buildUserCompositeId({
 *   userId: 'user-ABC',
 *   streamType: 'followers'
 * })
 * // Returns: 'user-ABC:followers'
 */
export function buildUserCompositeId({ userId, streamType }: UserStreamIdParts): string {
  return `${userId}${USER_STREAM_ID_DELIMITER}${streamType}`;
}

/**
 * Parse a composite user stream ID back into its parts
 *
 * @example
 * parseUserCompositeId('user-ABC:followers')
 * // Returns: { userId: 'user-ABC', streamType: 'followers' }
 */
export function parseUserCompositeId(compositeId: string): UserStreamIdParts {
  const sep = compositeId.indexOf(USER_STREAM_ID_DELIMITER);
  if (sep <= 0 || sep === compositeId.length - 1) {
    throw new Error(`Invalid user stream composite ID: ${compositeId}`);
  }

  return {
    userId: compositeId.substring(0, sep) as Pubky,
    streamType: compositeId.substring(sep + 1),
  };
}

/**
 * Extract stream type from a UserStreamTypes enum value
 *
 * @example
 * getStreamTypeFromStreamId('followers:today:all') // Returns: 'followers'
 * getStreamTypeFromStreamId('following:today:all') // Returns: 'following'
 */
export function getStreamTypeFromStreamId(streamId: UserStreamTypes): string {
  return streamId.split(':')[0];
}

export const createDefaultUserStream = (id: string, stream: Pubky[] = []): UserStreamModelSchema => {
  return {
    id,
    stream,
  };
};
