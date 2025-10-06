import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import type { TLocalFetchPostsParams, TLocalSavePostParams } from './post.types';

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

        const author = details.id.split(':')[0] as Core.Pubky;

        return {
          details: {
            id: details.id,
            content: details.content,
            indexed_at: details.indexed_at,
            author,
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
  static async save({ postId, content, kind, authorId, parentUri, attachments }: TLocalSavePostParams) {
    try {
      const postDetails: Core.PostDetailsModelSchema = {
        id: postId,
        content,
        indexed_at: Date.now(),
        kind,
        uri: `pubky://${authorId}/pub/pubky.app/posts/${postId.split(':')[1]}`,
        attachments: attachments ?? null,
      };

      const postRelationships: Core.PostRelationshipsModelSchema = {
        id: postId,
        replied: parentUri ?? null,
        reposted: null,
        mentioned: [],
      };

      const postCounts: Core.PostCountsModelSchema = {
        id: postId,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      await Promise.all([
        Core.PostDetailsModel.table.add(postDetails),
        Core.PostRelationshipsModel.table.add(postRelationships),
        Core.PostCountsModel.table.add(postCounts),
        Core.PostTagsModel.table.add({ id: postId, tags: [] }),
      ]);

      // If this is a reply, update parent's reply count
      if (parentUri) {
        const parentPostId = parentUri.split('/posts/')[1];
        const fullParentId = `${parentUri.split('/')[2]}:${parentPostId}`;
        const parentCounts = await Core.PostCountsModel.table.get(fullParentId);
        if (parentCounts) {
          await Core.PostCountsModel.insert({
            ...parentCounts,
            replies: parentCounts.replies + 1,
          });
        }
      }

      Logger.debug('Post saved successfully', { postId, kind, parentUri });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to save post', 500, {
        error,
        postId,
        content,
        kind,
        authorId,
      });
    }
  }
}
