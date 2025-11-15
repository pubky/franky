import * as Core from '@/core';

/**
 * Post stream API Endpoints
 * All API endpoints related to feed operations
 */

function buildPostStreamUrl(
  params: Core.TStreamQueryParams,
  source: Core.StreamSource,
  prefix: Core.STREAM_PREFIX,
): string {
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

  const relativeUrl = `${prefix}?${queryParams.toString()}`;
  return Core.buildNexusUrl(relativeUrl);
}

/**
 * Type-safe stream URL generators
 */
export const postStreamApi = {
  // All posts (no additional required parameters)
  all: (params: Core.TStreamAllParams) => buildPostStreamUrl(params, Core.StreamSource.ALL, Core.STREAM_PREFIX.POSTS),

  // Sources requiring observer_id
  following: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.FOLLOWING, Core.STREAM_PREFIX.POSTS),

  followers: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.FOLLOWERS, Core.STREAM_PREFIX.POSTS),

  friends: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.FRIENDS, Core.STREAM_PREFIX.POSTS),

  bookmarks: (params: Core.TStreamWithObserverParams) =>
    buildPostStreamUrl(params, Core.StreamSource.BOOKMARKS, Core.STREAM_PREFIX.POSTS),

  // Post replies requiring author_id and post_id
  post_replies: (params: Core.TStreamPostRepliesParams) =>
    buildPostStreamUrl(params, Core.StreamSource.REPLIES, Core.STREAM_PREFIX.POSTS),

  // Alias for replies (for backwards compatibility)
  postReplies: (params: Core.TStreamPostRepliesParams) =>
    buildPostStreamUrl(params, Core.StreamSource.REPLIES, Core.STREAM_PREFIX.POSTS),

  // Author posts requiring author_id
  author: (params: Core.TStreamAuthorParams) =>
    buildPostStreamUrl(params, Core.StreamSource.AUTHOR, Core.STREAM_PREFIX.POSTS),

  // Author replies requiring author_id
  author_replies: (params: Core.TStreamAuthorRepliesParams) =>
    buildPostStreamUrl(params, Core.StreamSource.AUTHOR_REPLIES, Core.STREAM_PREFIX.POSTS),

  // Alias for author_replies (for backwards compatibility)
  authorReplies: (params: Core.TStreamAuthorRepliesParams) =>
    buildPostStreamUrl(params, Core.StreamSource.AUTHOR_REPLIES, Core.STREAM_PREFIX.POSTS),

  // Posts by IDs (POST request)
  postsByIds: (params: Core.TStreamPostsByIdsParams) => {
    return { body: buildPostStreamBodyUrl(params), url: Core.buildNexusUrl(Core.STREAM_PREFIX.POSTS_BY_IDS) };
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

export type PostStreamApiEndpoint = keyof typeof postStreamApi;
