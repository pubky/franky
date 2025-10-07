import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import type { TLocalFetchPostsParams, TLocalReplyToPostParams } from './post.types';

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
   * Add a reply to a post
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to
   * @param params.replyDetails - Normalized reply details (should already be normalized by caller)
   */
  static async reply({ parentPostId, replyDetails }: TLocalReplyToPostParams): Promise<Core.NexusPost | null> {
    try {
      const parentPost = await Core.PostDetailsModel.table.get(parentPostId);
      if (!parentPost) {
        Logger.debug('Parent post not found for reply', { parentPostId });
        return null;
      }

      const replyRelationships: Core.PostRelationshipsModelSchema = {
        id: replyDetails.id,
        replied: parentPost.uri,
        reposted: null,
        mentioned: [],
      };

      const replyCounts: Core.PostCountsModelSchema = {
        id: replyDetails.id,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      await Promise.all([
        Core.PostDetailsModel.table.add(replyDetails),
        Core.PostRelationshipsModel.table.add(replyRelationships),
        Core.PostCountsModel.table.add(replyCounts),
      ]);

      const parentCounts = await Core.PostCountsModel.table.get(parentPostId);
      if (parentCounts) {
        await Core.PostCountsModel.upsert({
          ...parentCounts,
          replies: parentCounts.replies + 1,
        });
      }

      const author = replyDetails.id.split(':')[0] as Core.Pubky;

      const createdReply: Core.NexusPost = {
        details: {
          ...replyDetails,
          author,
        },
        counts: replyCounts,
        tags: [],
        relationships: replyRelationships,
        bookmark: null,
      };

      Logger.debug('Reply created successfully', { replyId: replyDetails.id, parentPostId });
      return createdReply;
    } catch (error) {
      Logger.error('Failed to add reply', { error, parentPostId, replyDetails });
      throw createDatabaseError(DatabaseErrorType.CREATE_FAILED, 'Failed to create reply', 500, {
        error,
        parentPostId,
        replyDetails,
      });
    }
  }
}
