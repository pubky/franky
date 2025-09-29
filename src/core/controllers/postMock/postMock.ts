import { PostMock, PostMockGenerator, PostModelPK, TagModel, UserModelPK, db } from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class PostMockController {
  private static isInitialized = false;

  private constructor() {} // Prevent instantiation

  /**
   * Initialize the controller with some default mock posts
   */
  private static async initialize(): Promise<void> {
    if (!this.isInitialized) {
      try {
        // Check if we already have posts in the database
        const existingCount = await db.postMocks.count();

        if (existingCount === 0) {
          // Generate 50 initial mock posts and save to database
          const initialPosts = PostMockGenerator.createMultiple(50);
          await db.postMocks.bulkAdd(initialPosts);
          Logger.debug(`Initialized PostMock database with ${initialPosts.length} posts`);
        }

        this.isInitialized = true;
      } catch (error) {
        throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to initialize PostMock database', 500, {
          error,
        });
      }
    }
  }

  /**
   * Fetch mock posts with optional pagination
   * @param limit - Number of posts to fetch (default: 30)
   * @param offset - Number of posts to skip (default: 0)
   * @returns Array of PostMock objects
   */
  static async fetch(limit: number = 30, offset: number = 0): Promise<PostMock[]> {
    await this.initialize();

    try {
      // Fetch posts from IndexedDB, sorted by creation time (newest first)
      return await db.postMocks
        .orderBy('createdAt')
        .reverse() // newest first
        .offset(offset)
        .limit(limit)
        .toArray();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to fetch PostMock records', 500, {
        error,
        limit,
        offset,
      });
    }
  }

  /**
   * Fetch posts after a specific cursor (for cursor-based pagination)
   * @param cursorId - Post ID to fetch after
   * @param limit - Number of posts to fetch (default: 10)
   * @returns Array of PostMock objects
   */
  static async fetchAfter(cursorId: PostModelPK, limit: number = 10): Promise<PostMock[]> {
    await this.initialize();

    try {
      // Find the cursor post to get its timestamp
      const cursorPost = await db.postMocks.get(cursorId);
      if (!cursorPost) {
        return []; // Cursor not found
      }

      // Fetch posts with createdAt less than cursor (older posts)
      return await db.postMocks
        .where('createdAt')
        .below(cursorPost.createdAt)
        .reverse() // newest first within the filtered set
        .limit(limit)
        .toArray();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to fetch PostMock records after cursor', 500, {
        error,
        cursorId,
        limit,
      });
    }
  }

  /**
   * Fetch posts before a specific cursor (for upward pagination)
   * @param cursorId - Post ID to fetch before
   * @param limit - Number of posts to fetch (default: 10)
   * @returns Array of PostMock objects
   */
  static async fetchBefore(cursorId: PostModelPK, limit: number = 10): Promise<PostMock[]> {
    await this.initialize();

    try {
      // Find the cursor post to get its timestamp
      const cursorPost = await db.postMocks.get(cursorId);
      if (!cursorPost) {
        return []; // Cursor not found
      }

      // Fetch posts with createdAt greater than cursor (newer posts)
      return await db.postMocks
        .where('createdAt')
        .above(cursorPost.createdAt)
        .reverse() // newest first
        .limit(limit)
        .toArray();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to fetch PostMock records before cursor', 500, {
        error,
        cursorId,
        limit,
      });
    }
  }

  /**
   * Add a new mock post
   * @param postData - Partial PostMock data (id and createdAt will be generated if not provided)
   * @returns The created PostMock
   */
  static async add(postData: Partial<PostMock> = {}): Promise<PostMock> {
    await this.initialize();

    try {
      const newPost = PostMockGenerator.create(postData);
      await db.postMocks.add(newPost);
      Logger.debug('Added new PostMock to database', { id: newPost.id });
      return newPost;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add PostMock record', 500, {
        error,
        postData,
      });
    }
  }

  /**
   * Delete a mock post by ID
   * @param id - Post ID to delete
   * @returns true if post was deleted, false if not found
   */
  static async delete(id: PostModelPK): Promise<boolean> {
    await this.initialize();

    try {
      // First check if the record exists
      const existingPost = await db.postMocks.get(id);
      if (!existingPost) {
        return false; // Post doesn't exist
      }

      await db.postMocks.delete(id);
      // Double-check that deletion was successful
      const stillExists = await db.postMocks.get(id);
      const wasDeleted = !stillExists;
      if (wasDeleted) {
        Logger.debug('Deleted PostMock from database', { id });
      }
      return wasDeleted;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to delete PostMock record', 500, {
        error,
        id,
      });
    }
  }

  /**
   * Get a specific post by ID
   * @param id - Post ID to find
   * @returns PostMock if found, null otherwise
   */
  static async findById(id: PostModelPK): Promise<PostMock | null> {
    await this.initialize();

    try {
      const post = await db.postMocks.get(id);
      return post || null;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to find PostMock record by ID', 500, {
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
      return await db.postMocks.count();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to count PostMock records', 500, { error });
    }
  }

  /**
   * Clear all posts (useful for testing)
   */
  static async clear(): Promise<void> {
    try {
      await db.postMocks.clear();
      this.isInitialized = false;
      Logger.debug('Cleared all PostMock records from database');
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to clear PostMock records', 500, { error });
    }
  }

  /**
   * Reset to initial state with fresh mock data
   */
  static async reset(): Promise<void> {
    await this.clear();
    await this.initialize();
  }

  /**
   * Add a tag to a post
   * @param postId - ID of the post to tag
   * @param label - Tag label
   * @param taggerId - ID of the user adding the tag
   * @returns true if tag was added, false if it already exists
   */
  static async addTag(postId: PostModelPK, label: string, taggerId: UserModelPK): Promise<boolean> {
    await this.initialize();

    try {
      const post = await db.postMocks.get(postId);
      if (!post) {
        throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Post not found', 404, { postId });
      }

      const normalizedLabel = label.toLowerCase().trim();
      const existingTag = post.tags.find((tag) => tag.label === normalizedLabel);

      if (existingTag) {
        // Add tagger to existing tag if not already present
        const added = existingTag.addTagger(taggerId);
        if (added) {
          await db.postMocks.put(post);
          Logger.debug('Added tagger to existing tag', { postId, label, taggerId });
          return true;
        }
        return false; // Tagger already exists
      } else {
        // Create new tag
        const newTag = new TagModel({
          label: normalizedLabel,
          taggers: [taggerId],
          taggers_count: 1,
          relationship: false,
        });

        post.tags.push(newTag);
        await db.postMocks.put(post);
        Logger.debug('Added new tag to post', { postId, label, taggerId });
        return true;
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
  static async removeTag(postId: PostModelPK, label: string, taggerId: UserModelPK): Promise<boolean> {
    await this.initialize();

    try {
      const post = await db.postMocks.get(postId);
      if (!post) {
        throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Post not found', 404, { postId });
      }

      const normalizedLabel = label.toLowerCase().trim();
      const tagIndex = post.tags.findIndex((tag) => tag.label === normalizedLabel);

      if (tagIndex === -1) {
        return false; // Tag not found
      }

      const tag = post.tags[tagIndex];
      const removed = tag.removeTagger(taggerId);

      if (removed) {
        // If no taggers left, remove the tag entirely
        if (tag.taggers_count === 0) {
          post.tags.splice(tagIndex, 1);
        }

        await db.postMocks.put(post);
        Logger.debug('Removed tag from post', { postId, label, taggerId });
        return true;
      }

      return false; // Tagger not found
    } catch (error) {
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
  static async getTags(postId: PostModelPK): Promise<TagModel[]> {
    await this.initialize();

    try {
      const post = await db.postMocks.get(postId);
      if (!post) {
        throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Post not found', 404, { postId });
      }

      return post.tags;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to get post tags', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Check if a user has tagged a post with a specific label
   * @param postId - ID of the post
   * @param label - Tag label
   * @param taggerId - ID of the user
   * @returns true if the user has tagged the post with this label
   */
  static async hasUserTagged(postId: PostModelPK, label: string, taggerId: UserModelPK): Promise<boolean> {
    await this.initialize();

    try {
      const post = await db.postMocks.get(postId);
      if (!post) {
        return false;
      }

      const normalizedLabel = label.toLowerCase().trim();
      const tag = post.tags.find((tag) => tag.label === normalizedLabel);

      return tag ? tag.hasUser(taggerId) : false;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to check user tag', 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }
}
