import * as Core from '@/core';

/**
 * Sort post IDs by their timestamp (indexed_at) in descending order (most recent first)
 *
 * @param postIds - Array of post IDs to sort
 * @returns Sorted array of post IDs (most recent first)
 */
export async function sortPostIdsByTimestamp(postIds: string[]): Promise<string[]> {
  if (postIds.length === 0) return [];

  const posts = await Core.PostDetailsModel.findByIdsPreserveOrder(postIds);
  return postIds
    .map((postId, index) => ({
      postId,
      timestamp: posts[index]?.indexed_at || 0,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => item.postId);
}
