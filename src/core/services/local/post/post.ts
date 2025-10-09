import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import type {
  TLocalFetchPostsParams,
  TLocalSavePostParams,
  TLocalDeleteRepostParams,
  TLocalDeletePostParams,
} from './post.types';
import { postUriBuilder } from 'pubky-app-specs';

export class LocalPostService {
  /**
   * Fetch posts with optional pagination
   * @param params - Parameters object
   * @param params.limit - Number of posts to fetch (default: 30)
   * @param params.offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async fetch({ limit = 30, offset = 0 }: TLocalFetchPostsParams = {}): Promise<Core.NexusPost[]> {
    try {
      const allRelationships = await Core.PostRelationshipsModel.table.toArray();
      const replyPostIds = new Set(allRelationships.filter((rel) => rel.replied).map((rel) => rel.id));

      const allPostDetails = await Core.PostDetailsModel.fetchPaginated(limit * 2, offset);
      const postDetails = allPostDetails.filter((post) => !replyPostIds.has(post.id)).slice(0, limit);

      if (postDetails.length === 0) {
        return [];
      }

      const postIds = postDetails.map((post) => post.id);

      const [countsData, tagsData, relationshipsData] = await Promise.all([
        Core.PostCountsModel.findByIds(postIds),
        Core.PostTagsModel.findByIds(postIds),
        Core.PostRelationshipsModel.findByIds(postIds),
      ]);

      const countsMap = new Map(countsData.map((c) => [c.id, c]));
      const tagsMap = new Map(tagsData.map((t) => [t.id, t]));
      const relationshipsMap = new Map(relationshipsData.map((r) => [r.id, r]));

      const replyCounts = new Map<string, number>();
      allRelationships.forEach((rel) => {
        if (rel.replied) {
          replyCounts.set(rel.replied, (replyCounts.get(rel.replied) || 0) + 1);
        }
      });
      const posts: Core.NexusPost[] = postDetails.map((details) => {
        const baseCounts = countsMap.get(details.id) || {
          id: details.id,
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        };

        const { pubky } = Core.parsePostCompositeId(details.id);

        return {
          details: {
            id: details.id,
            content: details.content,
            indexed_at: details.indexed_at,
            author: pubky,
            kind: details.kind,
            uri: details.uri,
            attachments: details.attachments,
          },
          counts: {
            ...baseCounts,
            replies: replyCounts.get(details.id) || 0, // Use actual reply count
          },
          tags: tagsMap.get(details.id)?.tags.map((t) => new Core.TagModel(t)) || [],
          relationships: relationshipsMap.get(details.id) || {
            id: details.id,
            replied: null,
            reposted: null,
            mentioned: [],
          },
          bookmark: null, // TODO: Add bookmark support if needed
        };
      });

      Logger.debug(`Fetched ${posts.length} posts from normalized tables`, { limit, offset });
      return posts;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to fetch Post records', 500, {
        error,
        limit,
        offset,
      });
    }
  }

  /**
   * Save a new post to the local database.
   *
   * Creates a new post with all its related records:
   * - Post details (content, kind, URI, etc.)
   * - Post counts (initialized to zero)
   * - Post relationships (parent URI if reply)
   * - Post tags (empty array)
   *
   * If the post is a reply, also updates the parent post's reply count.
   *
   * @param params.postId - Unique identifier for the post (format: "authorId:postId")
   * @param params.content - Post content
   * @param params.kind - Post kind ('short' or 'long')
   * @param params.authorId - Unique identifier of the post author
   * @param params.parentUri - URI of parent post if this is a reply
   * @param params.attachments - Optional array of attachment objects
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async create({ postId, content, kind, authorId, parentUri, attachments, repostedUri }: TLocalSavePostParams) {
    const { postId: postIdPart } = Core.parsePostCompositeId(postId);
    try {
      const postDetails: Core.PostDetailsModelSchema = {
        id: postId,
        content,
        indexed_at: Date.now(),
        kind,
        uri: postUriBuilder(authorId, postIdPart),
        attachments: attachments ?? null,
      };

      const postRelationships: Core.PostRelationshipsModelSchema = {
        id: postId,
        replied: parentUri ?? null,
        reposted: repostedUri ?? null,
        mentioned: [],
      };

      const postCounts: Core.PostCountsModelSchema = {
        id: postId,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostCountsModel.table,
          Core.PostTagsModel.table,
        ],
        async () => {
          await Promise.all([
            Core.PostDetailsModel.create(postDetails),
            Core.PostRelationshipsModel.create(postRelationships),
            Core.PostCountsModel.create(postCounts),
            Core.PostTagsModel.create({ id: postId, tags: [] }),
          ]);

          // Update parent reply count if this is a reply
          if (parentUri) {
            const fullParentId = Core.buildPostIdFromPubkyUri(parentUri);
            if (!fullParentId) return;

            const parentCounts = await Core.PostCountsModel.findById(fullParentId);
            if (!parentCounts) return;

            await Core.PostCountsModel.update(parentCounts.id, { replies: parentCounts.replies + 1 });
          }

          // Update original post repost count if this is a repost
          if (repostedUri) {
            const originalPostId = Core.buildPostIdFromPubkyUri(repostedUri);
            if (!originalPostId) return;

            const originalCounts = await Core.PostCountsModel.findById(originalPostId);
            if (!originalCounts) return;

            await Core.PostCountsModel.update(originalCounts.id, { reposts: originalCounts.reposts + 1 });
          }
        },
      );

      Logger.debug('Post saved successfully', { postId, kind, parentUri, repostedUri });
    } catch (error) {
      Logger.error('Failed to save post', { postId, authorId });
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to save post', 500, {
        error,
        postId,
        content,
        kind,
        authorId,
      });
    }
  }

  /**
   * Delete a repost from the local database.
   *
   * Removes the repost and updates the original post's repost count.
   *
   * @param params.repostId - Unique identifier for the repost to delete
   * @param params.userId - Unique identifier of the user deleting the repost
   * @param params.repostedUri - URI of the original post that was reposted
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async deleteRepost({ repostId, userId, repostedUri }: TLocalDeleteRepostParams) {
    try {
      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostCountsModel.table,
          Core.PostTagsModel.table,
        ],
        async () => {
          await Promise.all([
            Core.PostDetailsModel.deleteById(repostId),
            Core.PostRelationshipsModel.deleteById(repostId),
            Core.PostCountsModel.deleteById(repostId),
            Core.PostTagsModel.deleteById(repostId),
          ]);

          // Decrement original post repost count
          const originalPostId = Core.buildPostIdFromPubkyUri(repostedUri);
          if (!originalPostId) return;

          const originalCounts = await Core.PostCountsModel.findById(originalPostId);
          if (!originalCounts) return;

          await Core.PostCountsModel.update(originalCounts.id, {
            reposts: Math.max(0, originalCounts.reposts - 1),
          });
        },
      );

      Logger.debug('Repost deleted successfully', { repostId, userId, repostedUri });
    } catch (error) {
      Logger.error('Failed to delete repost', { repostId, userId });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to delete repost', 500, {
        error,
        repostId,
        userId,
        repostedUri,
      });
    }
  }

  /**
   * Delete a post from the local database.
   *
   * Removes the post and all related records. If the post is a reply,
   * decrements the parent post's reply count. If the post is a repost,
   * decrements the original post's repost count.
   *
   * @param params.postId - Unique identifier for the post to delete
   * @param params.userId - Unique identifier of the user deleting the post
   * @param params.parentUri - URI of parent post if this is a reply
   * @param params.repostedUri - URI of original post if this is a repost
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async deletePost({ postId, userId, parentUri, repostedUri }: TLocalDeletePostParams) {
    try {
      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostCountsModel.table,
          Core.PostTagsModel.table,
        ],
        async () => {
          await Promise.all([
            Core.PostDetailsModel.deleteById(postId),
            Core.PostRelationshipsModel.deleteById(postId),
            Core.PostCountsModel.deleteById(postId),
            Core.PostTagsModel.deleteById(postId),
          ]);

          // Decrement parent reply count if this is a reply
          if (parentUri) {
            const parentPostId = Core.buildPostIdFromPubkyUri(parentUri);
            if (!parentPostId) return;

            const parentCounts = await Core.PostCountsModel.findById(parentPostId);
            if (!parentCounts) return;

            await Core.PostCountsModel.update(parentCounts.id, {
              replies: Math.max(0, parentCounts.replies - 1),
            });
          }

          // Decrement original post repost count if this is a repost
          if (repostedUri) {
            const originalPostId = Core.buildPostIdFromPubkyUri(repostedUri);
            if (!originalPostId) return;

            const originalCounts = await Core.PostCountsModel.findById(originalPostId);
            if (!originalCounts) return;

            await Core.PostCountsModel.update(originalCounts.id, {
              reposts: Math.max(0, originalCounts.reposts - 1),
            });
          }
        },
      );

      Logger.debug('Post deleted successfully', { postId, userId });
    } catch (error) {
      Logger.error('Failed to delete post', { postId, userId });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to delete post', 500, {
        error,
        postId,
        userId,
      });
    }
  }
}
