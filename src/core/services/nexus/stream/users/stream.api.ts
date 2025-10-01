import {
  UserStreamSource,
  TUserStreamWithUserIdParams,
  TUserStreamInfluencersParams,
  TUserStreamPostRepliesParams,
  TUserStreamWithDepthParams,
  TUserStreamUsernameParams,
  TUserStreamUsersByIdsParams,
  TUserStreamBase,
} from './stream.types';

/**
 * Users Stream API Endpoints
 * All API endpoints related to user stream operations
 */
enum USER_STREAM_PREFIX {
  USERS = 'stream/users?',
  USERNAME = 'stream/users/username?',
  USERS_BY_IDS = 'stream/users/by_ids',
}

export function buildUserStreamUrl(
  params: Record<string, unknown>,
  source: UserStreamSource | null,
  prefix: USER_STREAM_PREFIX,
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

  return `${prefix}${queryParams.toString()}`;
}

/**
 * Type-safe user stream URL generators
 */
export const USERS_STREAM_API = {
  // Sources requiring user_id
  followers: (params: TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, UserStreamSource.FOLLOWERS, USER_STREAM_PREFIX.USERS),

  following: (params: TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, UserStreamSource.FOLLOWING, USER_STREAM_PREFIX.USERS),

  friends: (params: TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, UserStreamSource.FRIENDS, USER_STREAM_PREFIX.USERS),

  muted: (params: TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, UserStreamSource.MUTED, USER_STREAM_PREFIX.USERS),

  recommended: (params: TUserStreamWithUserIdParams) =>
    buildUserStreamUrl(params, UserStreamSource.RECOMMENDED, USER_STREAM_PREFIX.USERS),

  // Influencers with additional parameters
  influencers: (params: TUserStreamInfluencersParams) =>
    buildUserStreamUrl(params, UserStreamSource.INFLUENCERS, USER_STREAM_PREFIX.USERS),

  // Post replies requiring author_id and post_id
  postReplies: (params: TUserStreamPostRepliesParams) =>
    buildUserStreamUrl(params, UserStreamSource.POST_REPLIES, USER_STREAM_PREFIX.USERS),

  // Sources with depth parameter
  friendsWithDepth: (params: TUserStreamWithDepthParams) =>
    buildUserStreamUrl(params, UserStreamSource.FRIENDS, USER_STREAM_PREFIX.USERS),

  mostFollowed: (params: TUserStreamBase) =>
    buildUserStreamUrl(params, UserStreamSource.MOST_FOLLOWED, USER_STREAM_PREFIX.USERS),

  // Username search
  username: (params: TUserStreamUsernameParams) => buildUserStreamUrl(params, null, USER_STREAM_PREFIX.USERNAME),

  // Users by IDs (POST request)
  usersByIds: (params: TUserStreamUsersByIdsParams) => {
    return { body: buildUserStreamBodyUrl(params), url: USER_STREAM_PREFIX.USERS_BY_IDS };
  },
};

/**
 * Users by IDs endpoint (POST request)
 * Returns both the URL and the request body for the POST request
 */
export function buildUserStreamBodyUrl(params: TUserStreamUsersByIdsParams) {
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

export type UserStreamApiEndpoint = keyof typeof USERS_STREAM_API;
