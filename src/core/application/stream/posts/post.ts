import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  static async read({ streamId, limit = 30, skip = 0 }: Core.TStreamPostsParams): Promise<string[]> {
    try {
      // 1. Get stream from cache
      let cachedStream = await Core.LocalStreamPostsService.findById(streamId);

      // 2. Validate cache integrity (check for duplicates)
      if (cachedStream && !Core.LocalStreamPostsService.validateCacheIntegrity(cachedStream)) {
        await Core.LocalStreamPostsService.deleteById(streamId);
        cachedStream = null;
      }

      // 3. If no cache exists, fetch initial batch and create cache
      if (!cachedStream || cachedStream.stream.length === 0) {
        // Fetch from Nexus API
        const nexusPosts = await Core.NexusPostStreamService.fetch({
          streamId,
          limit,
          skip: 0,
        });

        const streamIds = await Core.LocalStreamPostsService.fetchAndCachePosts(streamId, [], nexusPosts);

        cachedStream = {
          stream: streamIds || [],
        };
      }

      // 4. Check if we need to fetch more posts
      const requestedEnd = skip + limit;

      // Keep fetching until we have enough posts or no more posts are available
      while (requestedEnd > cachedStream!.stream.length) {
        const currentCacheSize = cachedStream!.stream.length;

        // Fetch from Nexus API
        const nexusPosts = await Core.NexusPostStreamService.fetch({
          streamId,
          limit,
          skip: currentCacheSize,
        });

        const updatedStream = await Core.LocalStreamPostsService.fetchAndCachePosts(
          streamId,
          cachedStream!.stream,
          nexusPosts,
        );

        // If no new posts were fetched, break the loop
        if (!updatedStream || updatedStream.length === currentCacheSize) {
          break;
        }

        // Update cachedStream reference
        cachedStream = {
          stream: updatedStream || [],
        };
      }

      // 5. Return the requested slice from cache
      const result = cachedStream!.stream.slice(skip, skip + limit);

      return result;
    } catch (error) {
      Libs.Logger.error('Error in PostStreamApplication.read:', error);
      return [];
    }
  }
}
