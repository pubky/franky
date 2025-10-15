import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  static async read({ streamId, limit = 30, offset = 0 }: Core.TStreamPostsParams): Promise<string[]> {
    try {
      // 1. Get stream from cache
      let cachedStream = await Core.PostStreamModel.findById(streamId);

      // 2. Validate cache integrity (check for duplicates)
      if (cachedStream && !Core.LocalStreamService.validateCacheIntegrity(cachedStream)) {
        await Core.LocalStreamService.clearCorruptedCache(streamId);
        cachedStream = null;
      }

      // 3. If no cache exists, fetch initial batch and create cache
      if (!cachedStream || cachedStream.stream.length === 0) {
        const updatedStream = await Core.LocalStreamService.fetchAndCachePosts(streamId, 0);

        if (!updatedStream) {
          return [];
        }

        cachedStream = await Core.PostStreamModel.findById(streamId);
      }

      // 4. Check if we need to fetch more posts
      const requestedEnd = offset + limit;

      // Keep fetching until we have enough posts or no more posts are available
      while (requestedEnd > cachedStream!.stream.length) {
        const currentCacheSize = cachedStream!.stream.length;
        const updatedStream = await Core.LocalStreamService.fetchAndCachePosts(
          streamId,
          currentCacheSize,
          cachedStream!.stream,
        );

        // If no new posts were fetched, break the loop
        if (!updatedStream || updatedStream.length === currentCacheSize) {
          break;
        }

        // Update cachedStream reference
        cachedStream = await Core.PostStreamModel.findById(streamId);
      }

      // 5. Return the requested slice from cache
      const result = cachedStream!.stream.slice(offset, offset + limit);

      return result;
    } catch (error) {
      Libs.Logger.error('Error in PostStreamApplication.read:', error);
      return [];
    }
  }
}
