import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalPostService {
  /**
   * Fetch posts with optional pagination
   * @param params - Parameters object
   * @param params.limit - Number of posts to fetch (default: 30)
   * @param params.offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async fetch({ limit = 30, offset = 0 }: { limit?: number; offset?: number } = {}): Promise<Core.NexusPost[]> {
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
   * Get a specific post by ID
   * @param params - Parameters object
   * @param params.id - Post ID to find
   * @returns NexusPost if found, null otherwise
   */
  static async findById({ id }: { id: string }): Promise<Core.NexusPost | null> {
    try {
      const details = await Core.PostDetailsModel.table.get(id);
      if (!details) {
        return null;
      }

      const [counts, tags, relationships, replyCount] = await Promise.all([
        Core.PostCountsModel.table.get(id),
        Core.PostTagsModel.table.get(id),
        Core.PostRelationshipsModel.table.get(id),
        Core.PostRelationshipsModel.table.where('replied').equals(id).count(),
      ]);
      const baseCounts = counts || {
        id: details.id,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      const author = details.id.split(':')[0] as Core.Pubky;

      const post: Core.NexusPost = {
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
          replies: replyCount, // Use actual reply count
        },
        tags: tags?.tags.map((t) => new Core.TagModel(t)) || [],
        relationships: relationships || {
          id: details.id,
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: null, // TODO: Add bookmark support if needed
      };

      return post;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to find Post record by ID', 500, {
        error,
        id,
      });
    }
  }

  /**
   * Get total count of posts
   * @returns Total number of posts
   */
  static async count(): Promise<number> {
    try {
      return await Core.PostDetailsModel.count();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to count Post records', 500, { error });
    }
  }

  /**
   * Get reply IDs for a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get reply IDs for
   * @returns Array of reply post IDs
   */
  static async replyIds({ postId }: { postId: string }): Promise<string[]> {
    try {
      const replyRelationships = await Core.db.post_relationships.where('replied').equals(postId).toArray();

      return replyRelationships.map((rel) => rel.id);
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to fetch reply IDs', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Get replies to a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get replies for
   * @returns Array of NexusPost objects that are replies to the given post
   */
  static async replies({ postId }: { postId: string }): Promise<Core.NexusPost[]> {
    try {
      const replyRelationships = await Core.PostRelationshipsModel.getReplies(postId);

      if (replyRelationships.length === 0) {
        return [];
      }

      const replyPostIds = replyRelationships.map((rel) => rel.id);

      const postDetails = await Core.PostDetailsModel.findByIds(replyPostIds);

      if (postDetails.length === 0) {
        return [];
      }

      const [countsData, tagsData, relationshipsData] = await Promise.all([
        Core.PostCountsModel.findByIds(replyPostIds),
        Core.PostTagsModel.findByIds(replyPostIds),
        Core.PostRelationshipsModel.findByIds(replyPostIds),
      ]);

      const countsMap = new Map(countsData.map((c) => [c.id, c]));
      const tagsMap = new Map(tagsData.map((t) => [t.id, t]));
      const relationshipsMap = new Map(relationshipsData.map((r) => [r.id, r]));
      const replies: Core.NexusPost[] = postDetails.map((details) => {
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
          counts: countsMap.get(details.id) || {
            tags: 0,
            unique_tags: 0,
            replies: 0,
            reposts: 0,
          },
          tags: tagsMap.get(details.id)?.tags.map((t) => new Core.TagModel(t)) || [],
          relationships: relationshipsMap.get(details.id) || {
            replied: null,
            reposted: null,
            mentioned: [],
          },
          bookmark: null,
        };
      });

      replies.sort((a, b) => a.details.indexed_at - b.details.indexed_at);

      Logger.debug(`Fetched ${replies.length} replies for post ${postId}`);
      return replies;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to fetch replies', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Add a reply to a post
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to
   * @param params.replyDetails - Normalized reply details (should already be normalized by caller)
   * @returns The created reply post or null if failed
   */
  static async reply({
    parentPostId,
    replyDetails,
  }: {
    parentPostId: string;
    replyDetails: Core.PostDetailsModelSchema;
  }): Promise<Core.NexusPost | null> {
    try {
      const parentPost = await Core.PostDetailsModel.table.get(parentPostId);
      if (!parentPost) {
        Logger.debug('Parent post not found for reply', { parentPostId });
        return null;
      }

      const replyRelationships: Core.PostRelationshipsModelSchema = {
        id: replyDetails.id,
        replied: parentPostId,
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
        await Core.PostCountsModel.insert({
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
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add reply', 500, {
        error,
        parentPostId,
        replyDetails,
      });
    }
  }
}
