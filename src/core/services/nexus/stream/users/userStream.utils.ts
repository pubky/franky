import * as Core from '@/core';

const DELIMITER = ':';

/**
 * Create Nexus API parameters from a user stream ID
 *
 * Transforms stream identifiers into type-safe parameters for userStreamApi methods.
 * The apiParams type is automatically mapped to the correct type based on reach.
 *
 * Handles two formats:
 * - 2 parts: `userId:reach` (e.g., 'user123:followers')
 * - 3 parts: `source:timeframe:reach` (e.g., 'influencers:today:all')
 *
 * @param streamId - Stream identifier
 * @param baseParams - Base pagination/query parameters
 * @returns Object with reach and correctly typed apiParams for that reach
 *
 * @example
 * const { reach, apiParams } = createNexusParams('user123:followers', { skip: 0, limit: 20 });
 * // reach: 'followers', apiParams: TUserStreamWithUserIdParams (inferred!)
 * const url = userStreamApi[reach](apiParams); // Fully type-safe!
 */
export function createNexusParams(
  streamId: Core.UserStreamId,
  baseParams: Core.TUserStreamBase,
): NexusParamsResult<ReachType> {
  const parts = streamId.split(DELIMITER);

  // If we are dealing with userId:reach format
  if (parts.length === 2) {
    const [userId, reach] = parts;
    return {
      reach: reach as ReachType,
      apiParams: { user_id: userId as Core.Pubky, ...baseParams } as UserStreamApiParamsMap[ReachType],
    };
  }

  // If we are dealing with source:timeframe:reach format
  if (parts.length === 3) {
    const [source, timeframe, reach] = parts;

    // Influencers need timeframe and reach in params
    if (source === Core.UserStreamSource.INFLUENCERS) {
      return {
        reach: source,
        apiParams: {
          ...baseParams,
          timeframe: timeframe as Core.UserStreamTimeframe,
          reach: reach as Core.UserStreamReach,
        },
      } as NexusParamsResult<'influencers'>;
    }

    // Other 3-part formats use base params only
    return {
      reach: source as ReachType,
      apiParams: baseParams as UserStreamApiParamsMap[ReachType],
    };
  }

  throw new Error(`Invalid stream ID: "${streamId}". Expected 2 or 3 parts separated by "${DELIMITER}"`);
}

type UserStreamApiParamsMap = {
  followers: Core.TUserStreamWithUserIdParams;
  following: Core.TUserStreamWithUserIdParams;
  friends: Core.TUserStreamWithUserIdParams;
  muted: Core.TUserStreamWithUserIdParams;
  recommended: Core.TUserStreamWithUserIdParams;
  influencers: Core.TUserStreamInfluencersParams;
  most_followed: Core.TUserStreamBase;
};

type ReachType = keyof UserStreamApiParamsMap;

type NexusParamsResult<T extends ReachType> = {
  reach: T;
  apiParams: UserStreamApiParamsMap[T];
};
