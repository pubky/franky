import * as Core from '@/core';

/**
 * Feed API Endpoints
 * All API endpoints related to feed operations
 */
enum STREAM_PREFIX {
  POSTS = 'stream/posts?',
  USERS = 'stream/users?',
  POSTS_BY_IDS = 'stream/posts/by_ids',
}

function buildPostStreamUrl(params: Record<string, unknown>, source: Core.StreamSource, prefix: STREAM_PREFIX): string {
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

  const relativeUrl = `${prefix}${queryParams.toString()}`;
  return Core.buildNexusUrl(relativeUrl);
}

/**
 * Type-safe stream URL generators
 */
export const POSTS_STREAM_API = {
  // Sources requiring observer_id
  following: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.FOLLOWING, STREAM_PREFIX.POSTS),

  followers: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.FOLLOWERS, STREAM_PREFIX.POSTS),

  friends: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.FRIENDS, STREAM_PREFIX.POSTS),

  bookmarks: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.BOOKMARKS, STREAM_PREFIX.POSTS),

  // Post replies requiring author_id and post_id
  postReplies: (params: Core.TStreamPostRepliesParams) =>
    buildPostStreamUrl(params, Core.StreamSource.REPLIES, STREAM_PREFIX.POSTS),

  // Author posts requiring author_id
  author: (params: Core.TStreamAuthorParams) =>
    buildPostStreamUrl(params, Core.StreamSource.AUTHOR, STREAM_PREFIX.POSTS),

  // Author replies requiring author_id
  authorReplies: (params: Core.TStreamAuthorRepliesParams) =>
    buildPostStreamUrl(params, Core.StreamSource.AUTHOR_REPLIES, STREAM_PREFIX.POSTS),

  // All posts (no additional required parameters)
  all: (params: Core.TStreamAllParams) => buildPostStreamUrl(params, Core.StreamSource.ALL, STREAM_PREFIX.POSTS),

  // Posts by IDs (POST request)
  postsByIds: (params: Core.TStreamPostsByIdsParams) => {
    return { body: buildPostStreamBodyUrl(params), url: Core.buildNexusUrl(STREAM_PREFIX.POSTS_BY_IDS) };
  },
};

/**
 * Posts by IDs endpoint (POST request)
 * Returns both the URL and the request body for the POST request
 */
export function buildPostStreamBodyUrl(params: Core.TStreamPostsByIdsParams) {
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
