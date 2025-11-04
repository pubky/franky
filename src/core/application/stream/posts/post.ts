import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';

export class PostStreamApplication {
  private constructor() {}

  /**
   * Extracts post IDs from Nexus post response
   * Temporary function until Nexus provides an endpoint that returns only IDs
   *
   * @param posts - Array of posts from Nexus API
   * @returns Array of composite post IDs (author:postId)
   */
  private static extractPostIds(posts: Core.NexusPost[]): string[] {
    return posts.map((post) => Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }));
  }

  /**
   * Gets the timestamp from a post ID by looking up the post in IndexDB
   *
   * @param postId - Composite post ID
   * @returns Timestamp (indexed_at) of the post, or undefined if not found
   */
  private static async getTimestampFromPostId(postId: string): Promise<number | undefined> {
    try {
      const postDetails = await Core.PostDetailsModel.findById(postId);
      return postDetails?.indexed_at;
    } catch (error) {
      Libs.Logger.warn('Failed to get timestamp from post ID', { postId, error });
      return undefined;
    }
  }

  /**
   * Gets or fetches a stream slice based on cursor pagination
   *
   * @param streamId - The stream identifier (e.g., 'timeline:all:all')
   * @param limit - Number of posts to return (default: POSTS_PER_PAGE)
   * @param post_id - Cursor for pagination - composite ID of the last post
   * @param timestamp - Timestamp for cursor-based pagination from Nexus
   * @returns Array of post composite IDs for the requested slice
   */
  static async getOrFetchStreamSlice({
    streamId,
    limit = Config.NEXUS_POSTS_PER_PAGE,
    post_id,
    timestamp,
  }: Core.TReadStreamPostsParams): Promise<string[]> {
    try {
      Libs.Logger.debug('getOrFetchStreamSlice called', { streamId, limit, post_id, timestamp });

      // Step 1: Check if stream exists in cache
      const cachedStream = await Core.LocalStreamPostsService.findById(streamId);
      Libs.Logger.debug('Cache check', {
        hasCachedStream: !!cachedStream,
        cacheLength: cachedStream?.stream.length || 0,
      });

      // Step 2: If no post_id is provided, we're fetching the initial page
      if (!post_id) {
        // If cache exists and has posts, return from cache
        if (cachedStream && cachedStream.stream.length > 0) {
          Libs.Logger.debug('Returning first page from cache');
          return cachedStream.stream.slice(0, limit);
        }

        // No cache, fetch initial batch from Nexus (no timestamp = get most recent posts)
        Libs.Logger.debug('No cache found, fetching initial batch from Nexus');
        const nexusPosts = await Core.NexusPostStreamService.fetch({
          streamId,
          limit,
          // No timestamp on initial load = get most recent posts
        });
        const postIds = this.extractPostIds(nexusPosts);

        Libs.Logger.debug('Initial posts fetched', { count: postIds.length });

        // Cache the IDs
        await Core.LocalStreamPostsService.upsert(streamId, postIds);

        return postIds;
      }

      // Step 3: We have a post_id cursor, check cache first
      if (cachedStream && cachedStream.stream.length > 0) {
        const postIndex = cachedStream.stream.indexOf(post_id);

        Libs.Logger.debug('Cursor pagination check', {
          post_id,
          postIndex,
          cacheLength: cachedStream.stream.length,
          foundInCache: postIndex !== -1,
        });

        if (postIndex !== -1) {
          // Found the post in cache
          const startIndex = postIndex + 1; // Next post after cursor
          const endIndex = startIndex + limit;

          Libs.Logger.debug('Pagination indices', {
            startIndex,
            endIndex,
            cacheLength: cachedStream.stream.length,
            hasEnoughInCache: endIndex <= cachedStream.stream.length,
          });

          // Check if we have enough posts in cache
          if (endIndex <= cachedStream.stream.length) {
            // We have enough posts in cache, return them
            Libs.Logger.debug('Returning from cache (enough posts)');
            return cachedStream.stream.slice(startIndex, endIndex);
          }

          // Not enough posts in cache, need to fetch more
          Libs.Logger.debug('Not enough posts in cache, need to fetch more', {
            needed: limit,
            available: cachedStream.stream.length - startIndex,
          });

          // Use the provided timestamp or get it from the last cached post
          let fetchTimestamp = timestamp;
          if (!fetchTimestamp) {
            const lastPostId = cachedStream.stream[cachedStream.stream.length - 1];
            Libs.Logger.debug('Getting timestamp from last post', { lastPostId });
            fetchTimestamp = await this.getTimestampFromPostId(lastPostId);
            Libs.Logger.debug('Timestamp retrieved', { fetchTimestamp });
          }

          if (fetchTimestamp) {
            Libs.Logger.debug('Fetching more posts from Nexus', { fetchTimestamp, limit });

            // Fetch more posts from Nexus
            const nexusPosts = await Core.NexusPostStreamService.fetch({
              streamId,
              limit,
              timestamp: fetchTimestamp,
            });
            const newPostIds = this.extractPostIds(nexusPosts);

            Libs.Logger.debug('Posts fetched from Nexus', {
              count: newPostIds.length,
              newPostIds: newPostIds.slice(0, 3), // Log first 3 for debugging
            });

            // If no new posts from Nexus, we've reached the end
            if (newPostIds.length === 0) {
              Libs.Logger.debug('No more posts available from Nexus');
              return [];
            }

            // Filter out duplicates (safety check for race conditions or posts with same timestamp)
            const uniqueNewIds = newPostIds.filter((id) => !cachedStream.stream.includes(id));

            // Log warning if we found duplicates (shouldn't happen in normal pagination)
            if (uniqueNewIds.length < newPostIds.length) {
              Libs.Logger.warn('Duplicates found in fetched posts', {
                uniqueCount: uniqueNewIds.length,
                totalFetched: newPostIds.length,
                duplicates: newPostIds.length - uniqueNewIds.length,
              });
            }

            // If ALL posts are duplicates, we need to fetch older posts
            // This happens when the timestamp points to posts we already have
            if (uniqueNewIds.length === 0 && newPostIds.length > 0) {
              Libs.Logger.debug('All fetched posts are duplicates, fetching older posts');

              // Get timestamp from the OLDEST post in the Nexus response
              const oldestPost = nexusPosts[nexusPosts.length - 1];
              const olderTimestamp = oldestPost.details.indexed_at;

              Libs.Logger.debug('Fetching with older timestamp', { olderTimestamp });

              // Fetch again with older timestamp
              const olderPosts = await Core.NexusPostStreamService.fetch({
                streamId,
                limit,
                timestamp: olderTimestamp,
              });

              const olderPostIds = this.extractPostIds(olderPosts);
              const uniqueOlderIds = olderPostIds.filter((id) => !cachedStream.stream.includes(id));

              Libs.Logger.debug('Older posts fetched', {
                count: uniqueOlderIds.length,
              });

              // If still no new posts, we've reached the end
              if (uniqueOlderIds.length === 0) {
                Libs.Logger.debug('No older posts available, reached the end');
                return [];
              }

              // Update cache with older posts
              const updatedStream = [...cachedStream.stream, ...uniqueOlderIds];
              await Core.LocalStreamPostsService.upsert(streamId, updatedStream);

              // Return the newly fetched older posts
              const remainingOldPosts = cachedStream.stream.slice(startIndex);
              const postsToReturn = [...remainingOldPosts, ...uniqueOlderIds].slice(0, limit);

              Libs.Logger.debug('Returning posts with older fetch', {
                returning: postsToReturn.length,
              });

              return postsToReturn;
            }

            Libs.Logger.debug('Unique new IDs after filtering', {
              uniqueCount: uniqueNewIds.length,
              totalFetched: newPostIds.length,
            });

            // Append to cache
            const updatedStream = [...cachedStream.stream, ...uniqueNewIds];
            await Core.LocalStreamPostsService.upsert(streamId, updatedStream);

            Libs.Logger.debug('Cache updated', {
              previousLength: cachedStream.stream.length,
              newLength: updatedStream.length,
            });

            // Return the newly fetched posts (or what we have available)
            // We want to return posts from startIndex onwards, which includes:
            // - Any remaining posts from the old cache
            // - All the newly fetched posts
            const remainingOldPosts = cachedStream.stream.slice(startIndex);
            const postsToReturn = [...remainingOldPosts, ...uniqueNewIds].slice(0, limit);

            Libs.Logger.debug('Returning posts after fetch', {
              startIndex,
              remainingOldPosts: remainingOldPosts.length,
              newPosts: uniqueNewIds.length,
              returning: postsToReturn.length,
            });

            return postsToReturn;
          }

          // No timestamp available, return what we have left in cache
          Libs.Logger.warn('No timestamp available for fetching more posts', {
            lastPostId: cachedStream.stream[cachedStream.stream.length - 1],
          });
          const remainingPosts = cachedStream.stream.slice(
            startIndex,
            Math.min(startIndex + limit, cachedStream.stream.length),
          );
          Libs.Logger.debug('Returning remaining posts from cache', { count: remainingPosts.length });
          return remainingPosts;
        }

        // Post ID not found in cache
        Libs.Logger.warn('post_id not found in cache', { post_id, cacheLength: cachedStream.stream.length });
      }

      // Step 4: post_id not found in cache or no cache exists
      // Fetch from Nexus using timestamp
      if (!timestamp) {
        // Try to get timestamp from the post_id
        timestamp = await this.getTimestampFromPostId(post_id);
      }

      if (timestamp) {
        const nexusPosts = await Core.NexusPostStreamService.fetch({ streamId, limit, timestamp });
        const postIds = this.extractPostIds(nexusPosts);

        // Update cache (append or replace depending on existence)
        if (cachedStream && cachedStream.stream.length > 0) {
          const uniqueNewIds = postIds.filter((id) => !cachedStream.stream.includes(id));
          if (uniqueNewIds.length > 0) {
            const updatedStream = [...cachedStream.stream, ...uniqueNewIds];
            await Core.LocalStreamPostsService.upsert(streamId, updatedStream);
          }
        } else {
          await Core.LocalStreamPostsService.upsert(streamId, postIds);
        }

        return postIds;
      }

      // Fallback: no timestamp available, return empty
      Libs.Logger.warn('No timestamp available for pagination', { streamId, post_id });
      return [];
    } catch (error) {
      Libs.Logger.error('Error in PostStreamApplication.getOrFetchStreamSlice:', error);
      return [];
    }
  }
}
