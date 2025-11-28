/**
 * Forces fetching of new posts from Nexus, even when no posts are cached locally.
 * New posts are the most recent posts that come after (are newer than) the head post in the stream cache.
 * This is the smallest timestamp that we can set to force fetching new posts. UNIX time: Thu Jan 01 1970 00:00:01 GMT+0000 (1 second)
 * 
 * This is used when the streamCoordinator is calling the method to fetch new posts.
 */
export const FORCE_FETCH_NEW_POSTS = 1;

/**
 * The timestamp to indicate that the call is not coming from the streamCoordinator and there is not need to 
 * fetch newest posts.
 * New posts are the most recent posts that come after (are newer than) the head post in the stream cache
 */
export const SKIP_FETCH_NEW_POSTS = 0;

/**
 * The timestamp to indicate that no cached stream data was found locally.
 * Used when the stream cache is empty or unavailable. This forces to fetch from Nexus new posts.
 */
export const NOT_FOUND_CACHED_STREAM = 0;