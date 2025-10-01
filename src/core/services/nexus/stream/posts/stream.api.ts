import {
  StreamSource,
  TStreamWithObserverParams,
  TStreamPostRepliesParams,
  TStreamAuthorParams,
  TStreamAuthorRepliesParams,
  TStreamAllParams,
  TStreamPostsByIdsParams,
} from './stream.types';

/**
 * Feed API Endpoints
 * All API endpoints related to feed operations
 */
enum STREAM_PREFIX {
  POSTS = 'stream/posts?',
  USERS = 'stream/users?',
  POSTS_BY_IDS = 'stream/posts/by_ids',
}

export function buildStreamUrl(params: Record<string, unknown>, source: StreamSource, prefix: STREAM_PREFIX): string {
  const queryParams = new URLSearchParams();

  // Add source parameter
  queryParams.append('source', source);

  // Add all parameters that exist (much simpler!)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'tags' && Array.isArray(value)) {
        // Handle tags specially - validate max 5 and join
        const validTags = value.slice(0, 5);
        if (validTags.length > 0) {
          queryParams.append('tags', validTags.join(','));
        }
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return `${prefix}${queryParams.toString()}`;
}

/**
 * Type-safe stream URL generators
 */
export const POSTS_STREAM_API = {
  // Sources requiring observer_id
  following: (params: TStreamWithObserverParams) => buildStreamUrl(params, StreamSource.FOLLOWING, STREAM_PREFIX.POSTS),

  followers: (params: TStreamWithObserverParams) => buildStreamUrl(params, StreamSource.FOLLOWERS, STREAM_PREFIX.POSTS),

  friends: (params: TStreamWithObserverParams) => buildStreamUrl(params, StreamSource.FRIENDS, STREAM_PREFIX.POSTS),

  bookmarks: (params: TStreamWithObserverParams) => buildStreamUrl(params, StreamSource.BOOKMARKS, STREAM_PREFIX.POSTS),

  // Post replies requiring author_id and post_id
  postReplies: (params: TStreamPostRepliesParams) => buildStreamUrl(params, StreamSource.REPLIES, STREAM_PREFIX.POSTS),

  // Author posts requiring author_id
  author: (params: TStreamAuthorParams) => buildStreamUrl(params, StreamSource.AUTHOR, STREAM_PREFIX.POSTS),

  // Author replies requiring author_id
  authorReplies: (params: TStreamAuthorRepliesParams) =>
    buildStreamUrl(params, StreamSource.AUTHOR_REPLIES, STREAM_PREFIX.POSTS),

  // All posts (no additional required parameters)
  all: (params: TStreamAllParams) => buildStreamUrl(params, StreamSource.ALL, STREAM_PREFIX.POSTS),

  // Posts by IDs (POST request)
  postsByIds: (params: TStreamPostsByIdsParams) => {
    return { body: buildStreamBodyUrl(params), url: STREAM_PREFIX.POSTS_BY_IDS };
  },
};

/**
 * Posts by IDs endpoint (POST request)
 * Returns both the URL and the request body for the POST request
 */
export function buildStreamBodyUrl(params: TStreamPostsByIdsParams) {
  // Build request body
  const body: { post_ids: string[]; viewer_id?: string } = {
    post_ids: params.post_ids,
  };

  if (params.viewer_id) {
    body.viewer_id = params.viewer_id;
  }

  return body;
}

export type PostStreamApiEndpoint = keyof typeof POSTS_STREAM_API;
