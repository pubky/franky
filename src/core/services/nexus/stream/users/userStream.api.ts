import * as Core from '@/core';

/**
 * Users Stream API Endpoints
 * All API endpoints related to user stream operations
 */

function buildUserStreamUrl(
  params: Record<string, unknown>,
  source: Core.UserStreamSource | null,
  prefix: Core.USER_STREAM_PREFIX,
): string {
  const queryParams = new URLSearchParams();

  // Add source parameter
  if (source) {
    queryParams.append('source', source);
  }

  // Add all parameters that exist (much simpler!)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Filter out negative values for skip and limit
      if ((key === 'skip' || key === 'limit') && typeof value === 'number' && value < 0) {
        return;
      }
      queryParams.append(key, String(value));
    }
  });

  const relativeUrl = `${prefix}?${queryParams.toString()}`;
  return Core.buildNexusUrl(relativeUrl);
}

/**
 * Type-safe user stream URL generators
 */
export const userStreamApi = {
  // Sources requiring user_id
  followers: (params: Core.TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.FOLLOWERS, Core.USER_STREAM_PREFIX.USERS),

  following: (params: Core.TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.FOLLOWING, Core.USER_STREAM_PREFIX.USERS),

  friends: (params: Core.TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.FRIENDS, Core.USER_STREAM_PREFIX.USERS),

  muted: (params: Core.TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.MUTED, Core.USER_STREAM_PREFIX.USERS),

  recommended: (params: Core.TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.RECOMMENDED, Core.USER_STREAM_PREFIX.USERS),

  // Influencers with additional parameters
  influencers: (params: Core.TUserStreamInfluencersParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.INFLUENCERS, Core.USER_STREAM_PREFIX.USERS),

  // Post replies requiring author_id and post_id
  postReplies: (params: Core.TUserStreamPostRepliesParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.POST_REPLIES, Core.USER_STREAM_PREFIX.USERS),

  // Sources with depth parameter
  friendsWithDepth: (params: Core.TUserStreamWithDepthParams) =>
    buildUserStreamUrl(params, Core.UserStreamSource.FRIENDS, Core.USER_STREAM_PREFIX.USERS),

  mostFollowed: (params: Core.TUserStreamBase) =>
    buildUserStreamUrl(params, Core.UserStreamSource.MOST_FOLLOWED, Core.USER_STREAM_PREFIX.USERS),

  // Username search
  username: (params: Core.TUserStreamUsernameParams) =>
    buildUserStreamUrl(params, null, Core.USER_STREAM_PREFIX.USERNAME),

  // Users by IDs (POST request)
  usersByIds: (params: Core.TUserStreamUsersByIdsParams) => {
    return { body: buildUserStreamBodyUrl(params), url: Core.buildNexusUrl(Core.USER_STREAM_PREFIX.USERS_BY_IDS) };
  },
};

/**
 * Users by IDs endpoint (POST request)
 * Returns both the URL and the request body for the POST request
 */
export function buildUserStreamBodyUrl(params: Core.TUserStreamUsersByIdsParams) {
  // Build request body
  const body: { user_ids: string[]; viewer_id?: string; depth?: number } = {
    user_ids: params.user_ids,
  };

  if (params.viewer_id) {
    body.viewer_id = params.viewer_id;
  }

  if (params.depth !== undefined) {
    body.depth = params.depth;
  }

  return body;
}

export type UserStreamApiEndpoint = keyof typeof userStreamApi;
