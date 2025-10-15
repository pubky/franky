import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  private constructor() {}

  /**
   * Gets and validates the cached stream, removing invalid cache if necessary
   *
   * @param streamId - The stream identifier
   * @returns Validated cached stream or null
   */
  private static async getValidatedCachedStream(streamId: Core.PostStreamTypes): Promise<{ stream: string[] } | null> {
    const cachedStream = await Core.LocalStreamPostsService.findById(streamId);

    if (!cachedStream) {
      return null;
    }

    const isValid = Core.LocalStreamPostsService.validateCacheIntegrity(cachedStream);
    if (!isValid) {
      await Core.LocalStreamPostsService.deleteById(streamId);
      return null;
    }

    return cachedStream;
  }

  /**
   * Initializes cache by fetching the first batch of posts
   *
   * @param streamId - The stream identifier
   * @param limit - Number of posts to fetch
   * @returns Initial cached stream with fetched posts
   */
  private static async initializeCache(streamId: Core.PostStreamTypes, limit: number): Promise<{ stream: string[] }> {
    const nexusPosts = await Core.NexusPostStreamService.fetch({
      streamId,
      limit,
      skip: 0,
    });

    const streamIds = await this.fetchAndCachePosts(streamId, [], nexusPosts);

    return { stream: streamIds };
  }

  /**
   * Checks if more posts need to be fetched based on the requested range
   *
   * @param skip - Number of posts to skip
   * @param limit - Number of posts to return
   * @param currentStreamLength - Current length of cached stream
   * @returns True if more posts are needed
   */
  private static needsMorePosts(skip: number, limit: number, currentStreamLength: number): boolean {
    const requestedEnd = skip + limit;
    return requestedEnd > currentStreamLength;
  }

  /**
   * Fetches additional posts until the cache has enough posts for the requested slice
   *
   * @param streamId - The stream identifier
   * @param cachedStream - Current cached stream
   * @param limit - Number of posts per batch
   * @param skip - Number of posts to skip
   * @returns Updated cached stream with additional posts
   */
  private static async fillCacheToRequestedSize(
    streamId: Core.PostStreamTypes,
    cachedStream: { stream: string[] },
    limit: number,
    skip: number,
  ): Promise<{ stream: string[] }> {
    let updatedCache = { ...cachedStream };

    while (this.needsMorePosts(skip, limit, updatedCache.stream.length)) {
      const currentCacheSize = updatedCache.stream.length;

      const nexusPosts = await Core.NexusPostStreamService.fetch({
        streamId,
        limit,
        skip,
      });
      const updatedStream = await this.fetchAndCachePosts(streamId, updatedCache.stream, nexusPosts);

      // No new posts were fetched, stop trying
      if (updatedStream.length === currentCacheSize) {
        break;
      }

      updatedCache = { stream: updatedStream };
    }

    return updatedCache;
  }

  /**
   * Gets or fetches a slice of the stream based on pagination parameters
   *
   * @param streamId - The stream identifier
   * @param limit - Number of posts to return (default: 30)
   * @param skip - Number of posts to skip (default: 0)
   * @returns Array of post composite IDs for the requested slice
   */
  static async getOrFetchStreamSlice({
    streamId,
    limit = 30,
    skip = 0,
  }: Core.TReadStreamPostsParams): Promise<string[]> {
    try {
      // Step 1: Get and validate cached stream
      let cachedStream = await this.getValidatedCachedStream(streamId);

      // Step 2: Initialize cache if empty or non-existent
      if (!cachedStream || cachedStream.stream.length === 0) {
        cachedStream = await this.initializeCache(streamId, limit);
      }

      // Step 3: Fill cache with more posts if needed
      cachedStream = await this.fillCacheToRequestedSize(streamId, cachedStream, limit, skip);

      // Step 4: Extract and return the requested slice
      return cachedStream.stream.slice(skip, skip + limit);
    } catch (error) {
      Libs.Logger.error('Error in PostStreamApplication.getOrFetchStreamSlice:', error);
      return [];
    }
  }

  /**
   * Fetches users for provided posts from Nexus API
   *
   * @param posts - Array of posts returned by Nexus API
   * @returns Users corresponding to the post authors
   */
  static async fetchUsersForPosts(posts: Core.NexusPost[]): Promise<Core.NexusUser[]> {
    try {
      if (!posts || posts.length === 0) {
        return [];
      }

      const users = posts.map((post) => post.details.author);
      const usersData = await Core.NexusUserStreamService.fetchByIds({ user_ids: users });

      return usersData;
    } catch (error) {
      Libs.Logger.error('Failed to fetch users for posts', { error, posts: posts?.length ?? 0 });
      throw error;
    }
  }

  /**
   * Persists users and posts locally and updates the stream cache
   *
   * @param streamId - The stream to update
   * @param existingStream - Current cached stream IDs
   * @param posts - Posts to persist
   * @param usersData - Users to persist
   * @returns Updated stream array
   */
  static async persistPostsAndUpdateStream(
    streamId: Core.PostStreamTypes,
    existingStream: string[],
    posts: Core.NexusPost[],
    usersData: Core.NexusUser[],
  ): Promise<string[]> {
    try {
      // Persist users and posts
      await Core.LocalStreamPostsService.persistPosts(posts);
      if (usersData && usersData.length > 0) {
        await Core.LocalStreamUsersService.persistUsers(usersData);
      }

      // Extract composite IDs
      const fetchedPostIds = posts.map((post) =>
        Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }),
      );

      // Filter out duplicates already present in the stream
      const newPostIds = fetchedPostIds.filter((id) => !existingStream.includes(id));

      // No new unique posts -> no update, keep existing stream
      if (newPostIds.length === 0) {
        return existingStream;
      }

      // Merge with existing stream and update cache
      const updatedStream = [...existingStream, ...newPostIds];
      await Core.LocalStreamPostsService.upsert(streamId, updatedStream);

      return updatedStream;
    } catch (error) {
      Libs.Logger.error('Failed to persist posts and update stream', { streamId, error });
      throw error;
    }
  }

  /**
   * Fetches posts from Nexus, persists them locally, and updates the cache
   *
   * @param streamId - The type of stream to fetch
   * @param existingStream - Current cached stream IDs to merge with new ones
   * @returns Updated stream array or null if no posts found
   */
  static async fetchAndCachePosts(
    streamId: Core.PostStreamTypes,
    existingStream: string[] = [],
    nexusPosts: Core.NexusPost[] = [],
  ): Promise<string[]> {
    try {
      // This local service does not fetch remotely; posts must be provided by caller
      const posts: Core.NexusPost[] = nexusPosts;

      // No posts available -> no update, keep existing stream
      if (!posts || posts.length === 0) {
        return existingStream;
      }

      // Fetch users for the provided posts
      const usersData = await this.fetchUsersForPosts(posts);

      // Persist and update the stream
      const updatedStream = await this.persistPostsAndUpdateStream(streamId, existingStream, posts, usersData);

      return updatedStream;
    } catch (error) {
      Libs.Logger.error('Failed to fetch and cache posts', { streamId, error });
      throw error;
    }
  }
}
