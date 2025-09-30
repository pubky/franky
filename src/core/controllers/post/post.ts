import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import * as Core from '@/core';

export class PostController {
  private static isInitialized = false;

  private constructor() {} // Prevent instantiation

  /**
   * Initialize the controller
   */
  private static async initialize(): Promise<void> {
    if (!this.isInitialized) {
      try {
        await Core.db.initialize();
        this.isInitialized = true;
      } catch (error) {
        throw createDatabaseError(DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize Post database', 500, {
          error,
        });
      }
    }
  }

  /**
   * Fetch posts with optional pagination
   * @param limit - Number of posts to fetch (default: 30)
   * @param offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async fetch(limit: number = 30, offset: number = 0): Promise<Core.NexusPost[]> {
    await this.initialize();

    try {
      // Get all relationships first (we need this for both filtering and counting)
      const allRelationships = await Core.PostRelationshipsModel.table.toArray();
      const replyPostIds = new Set(allRelationships.filter((rel) => rel.replied).map((rel) => rel.id));

      // Fetch post details with pagination and filter out replies
      const allPostDetails = await Core.PostDetailsModel.fetchPaginated(limit * 2, offset); // Fetch more to account for filtering
      const postDetails = allPostDetails.filter((post) => !replyPostIds.has(post.id)).slice(0, limit);

      // If no posts found, return empty array
      if (postDetails.length === 0) {
        return [];
      }

      // Get post IDs for fetching related data
      const postIds = postDetails.map((post) => post.id);

      // Fetch related data in parallel
      const [countsData, tagsData, relationshipsData] = await Promise.all([
        Core.PostCountsModel.getByIds(postIds),
        Core.PostTagsModel.getByIds(postIds),
        Core.PostRelationshipsModel.getByIds(postIds),
      ]);

      // Create lookup maps for efficient joining
      const countsMap = new Map(countsData.map((c) => [c.id, c]));
      const tagsMap = new Map(tagsData.map((t) => [t.id, t]));
      const relationshipsMap = new Map(relationshipsData.map((r) => [r.id, r]));

      // Calculate reply counts for each post
      const replyCounts = new Map<string, number>();
      allRelationships.forEach((rel) => {
        if (rel.replied) {
          replyCounts.set(rel.replied, (replyCounts.get(rel.replied) || 0) + 1);
        }
      });

      // Combine data into NexusPost objects
      const posts: Core.NexusPost[] = postDetails.map((details) => {
        const baseCounts = countsMap.get(details.id) || {
          id: details.id,
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        };

        return {
          details: {
            id: details.id,
            content: details.content,
            indexed_at: details.indexed_at,
            author: details.author,
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
   * @param id - Post ID to find
   * @returns NexusPost if found, null otherwise
   */
  static async findById(id: string): Promise<Core.NexusPost | null> {
    await this.initialize();

    try {
      // Fetch post details
      const details = await Core.PostDetailsModel.getById(id);
      if (!details) {
        return null;
      }

      // Fetch related data in parallel and calculate reply count
      const [counts, tags, relationships, replyCount] = await Promise.all([
        Core.PostCountsModel.getById(id),
        Core.PostTagsModel.getById(id),
        Core.PostRelationshipsModel.getById(id),
        Core.PostRelationshipsModel.table.where('replied').equals(id).count(),
      ]);

      // Combine into NexusPost
      const baseCounts = counts || {
        id: details.id,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      const post: Core.NexusPost = {
        details: {
          id: details.id,
          content: details.content,
          indexed_at: details.indexed_at,
          author: details.author,
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
    await this.initialize();

    try {
      return await Core.PostDetailsModel.getCount();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to count Post records', 500, { error });
    }
  }

  /**
   * Add a tag to a post
   * @param postId - ID of the post to tag
   * @param label - Tag label
   * @param taggerId - ID of the user adding the tag
   * @returns true if tag was added, false if it already exists
   */
  static async addTag(postId: string, label: string, taggerId: Core.Pubky): Promise<boolean> {
    await this.initialize();

    try {
      // Check if post exists
      const postDetails = await Core.PostDetailsModel.getById(postId);
      if (!postDetails) {
        Logger.debug('Post not found for addTag', { postId });
        return false;
      }

      // Normalize tag before processing
      const normalizedTag = await Core.TagNormalizer.to(postDetails.uri, label.trim(), taggerId);
      const normalizedLabel = normalizedTag.tag.label.toLowerCase();

      // Check if tags exist first
      const existingTags = await Core.PostTagsModel.getById(postId);

      if (existingTags) {
        // Use existing tags
        const postTagsModel = new Core.PostTagsModel(existingTags);
        const added = postTagsModel.addTagger(normalizedLabel, taggerId);

        if (added) {
          // Save the updated model
          await Core.PostTagsModel.insert({
            id: postId,
            tags: postTagsModel.tags as Core.NexusTag[],
          });
          Logger.debug('Added tagger using existing PostTagsModel', { postId, label: normalizedLabel, taggerId });
        }
        return added;
      } else {
        // Create new tags record
        const newPostTags = new Core.PostTagsModel({
          id: postId,
          tags: [],
        });

        const added = newPostTags.addTagger(normalizedLabel, taggerId);
        if (added) {
          await Core.PostTagsModel.insert({
            id: postId,
            tags: newPostTags.tags as Core.NexusTag[],
          });
          Logger.debug('Created new PostTagsModel and added tag', { postId, label: normalizedLabel, taggerId });
        }
        return added;
      }
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add tag to post', 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }

  /**
   * Remove a tag from a post
   * @param postId - ID of the post
   * @param label - Tag label to remove
   * @param taggerId - ID of the user removing the tag
   * @returns true if tag was removed, false if not found
   */
  static async removeTag(postId: string, label: string, taggerId: Core.Pubky): Promise<boolean> {
    await this.initialize();

    try {
      // Check if post exists
      const postDetails = await Core.PostDetailsModel.getById(postId);
      if (!postDetails) {
        Logger.debug('Post not found for removeTag', { postId });
        return false;
      }

      // Normalize tag before processing
      const normalizedTag = await Core.TagNormalizer.to(postDetails.uri, label.trim(), taggerId);
      const normalizedLabel = normalizedTag.tag.label.toLowerCase();

      // Check if tags exist first
      const existingTags = await Core.PostTagsModel.getById(postId);

      if (!existingTags) {
        Logger.debug('Post tags not found', { postId });
        return false;
      }

      // Use existing tags
      const postTagsModel = new Core.PostTagsModel(existingTags);
      const removed = postTagsModel.removeTagger(normalizedLabel, taggerId);

      if (removed) {
        // Remove tags with no taggers
        postTagsModel.tags = postTagsModel.tags.filter((tag) => tag.taggers_count > 0);

        // Save the updated model
        await Core.PostTagsModel.insert({
          id: postId,
          tags: postTagsModel.tags as Core.NexusTag[],
        });
        Logger.debug('Removed tagger using PostTagsModel', { postId, label: normalizedLabel, taggerId });
      }
      return removed;
    } catch (error) {
      Logger.error('Error in removeTag', { error, postId, label, taggerId });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to remove tag from post', 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }

  /**
   * Get all tags for a post
   * @param postId - ID of the post
   * @returns Array of TagModel objects
   */
  static async getTags(postId: string): Promise<Core.TagModel[]> {
    await this.initialize();

    try {
      // Check if tags exist first
      const existingTags = await Core.PostTagsModel.getById(postId);

      if (!existingTags) {
        return [];
      }

      // Use existing tags from database
      const postTagsModel = new Core.PostTagsModel(existingTags);
      return postTagsModel.tags;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to get post tags', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Get replies to a specific post
   * @param postId - ID of the post to get replies for
   * @returns Array of NexusPost objects that are replies to the given post
   */
  static async getReplies(postId: string): Promise<Core.NexusPost[]> {
    await this.initialize();

    try {
      // Find all relationships where replied === postId
      const replyRelationships = await Core.PostRelationshipsModel.getReplies(postId);

      if (replyRelationships.length === 0) {
        return [];
      }

      // Get the IDs of the reply posts
      const replyPostIds = replyRelationships.map((rel) => rel.id);

      // Fetch the reply posts using the same logic as fetch()
      const postDetails = await Core.PostDetailsModel.getByIds(replyPostIds);

      if (postDetails.length === 0) {
        return [];
      }

      // Fetch related data in parallel
      const [countsData, tagsData, relationshipsData] = await Promise.all([
        Core.PostCountsModel.getByIds(replyPostIds),
        Core.PostTagsModel.getByIds(replyPostIds),
        Core.PostRelationshipsModel.getByIds(replyPostIds),
      ]);

      // Create lookup maps for efficient joining
      const countsMap = new Map(countsData.map((c) => [c.id, c]));
      const tagsMap = new Map(tagsData.map((t) => [t.id, t]));
      const relationshipsMap = new Map(relationshipsData.map((r) => [r.id, r]));

      // Combine data into NexusPost objects
      const replies: Core.NexusPost[] = postDetails.map((details) => ({
        details: {
          id: details.id,
          content: details.content,
          indexed_at: details.indexed_at,
          author: details.author,
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
      }));

      // Sort by indexed_at (oldest first for replies)
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
   * @param parentPostId - ID of the post being replied to
   * @param content - Reply content
   * @param authorId - ID of the user creating the reply
   * @returns The created reply post or null if failed
   */
  static async addReply(parentPostId: string, content: string, authorId: Core.Pubky): Promise<Core.NexusPost | null> {
    await this.initialize();

    try {
      // Check if parent post exists
      const parentPost = await Core.PostDetailsModel.getById(parentPostId);
      if (!parentPost) {
        Logger.debug('Parent post not found for reply', { parentPostId });
        return null;
      }

      // Normalize post content before creating reply
      const normalizedPost = await Core.PostNormalizer.to(
        {
          content: content.trim(),
          indexed_at: Date.now(),
          author: authorId,
          kind: 'short',
          attachments: null,
        },
        authorId,
      );

      // Generate reply ID
      const replyId = `reply-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const now = Date.now();

      // Create reply post details
      const replyDetails: Core.PostDetailsModelSchema = {
        id: replyId,
        content: normalizedPost.post.content,
        indexed_at: now,
        author: authorId,
        kind: normalizedPost.post.kind === 'Short' ? 'short' : 'long',
        uri: normalizedPost.meta.url,
        attachments: normalizedPost.post.attachments || null,
      };

      // Create reply relationships
      const replyRelationships: Core.PostRelationshipsModelSchema = {
        id: replyId,
        replied: parentPostId,
        reposted: null,
        mentioned: [],
      };

      // Create reply counts
      const replyCounts: Core.PostCountsModelSchema = {
        id: replyId,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      // Insert into database
      await Promise.all([
        Core.PostDetailsModel.table.add(replyDetails),
        Core.PostRelationshipsModel.table.add(replyRelationships),
        Core.PostCountsModel.table.add(replyCounts),
      ]);

      // Return the created reply as NexusPost
      const createdReply: Core.NexusPost = {
        details: replyDetails,
        counts: replyCounts,
        tags: [],
        relationships: replyRelationships,
        bookmark: null,
      };

      Logger.debug('Reply created successfully', { replyId, parentPostId });
      return createdReply;
    } catch (error) {
      Logger.error('Failed to add reply', { error, parentPostId, content, authorId });
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add reply', 500, {
        error,
        parentPostId,
        content,
        authorId,
      });
    }
  }
}
