import { PostMock, PostMockGenerator, PostModelPK, db } from '@/core';
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
}
