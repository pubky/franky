import { Table } from 'dexie';
import { PostPK, PostTag, SyncStatus, Timestamp, NexusBookmark, NexusPost, db, Tag, PostSchema } from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import { SYNC_TTL } from '@/config/sync';

export class Post implements NexusPost {
  private static table: Table<PostSchema> = db.table('posts');

  id: PostPK;
  details: NexusPost['details'];
  counts: NexusPost['counts'];
  relationships: NexusPost['relationships'];
  tags: Tag[];
  bookmark: NexusBookmark | null;
  indexed_at: Timestamp | null;
  created_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;

  constructor(post: PostSchema) {
    this.id = post.details.id;
    this.details = post.details;
    this.counts = post.counts;
    this.relationships = post.relationships;
    this.tags = post.tags.map((tag: PostTag) => new Tag(tag));
    this.bookmark = post.bookmark || null;
    this.indexed_at = post.indexed_at;
    this.created_at = post.created_at;
    this.sync_status = post.sync_status;
    this.sync_ttl = post.sync_ttl;
  }

  // Database operations
  async save(): Promise<void> {
    try {
      const now = Date.now();
      this.created_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await db.transaction('rw', Post.table, async () => {
        await Post.table.put({
          ...this,
          id: this.details.id,
          tags: this.tags.map((tag) => ({
            label: tag.label,
            taggers: tag.taggers,
            taggers_count: tag.taggers_count,
            relationship: tag.relationship,
          })),
        });
      });

      Logger.debug('Saved post to database:', { id: this.details.id });
    } catch (error) {
      Logger.error('Error saving post:', error);
      Logger.error('Post data:', {
        id: this.details.id,
        details: this.details,
        error: error instanceof Error ? error.message : String(error),
      });
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, `Failed to save post ${this.details.id}`, 500, {
        error: error instanceof Error ? error.message : String(error),
        postId: this.details.id,
      });
    }
  }

  async edit(updates: Partial<PostSchema>): Promise<void> {
    try {
      const now = Date.now();

      if (updates.details) this.details = { ...this.details, ...updates.details };
      if (updates.counts) this.counts = { ...this.counts, ...updates.counts };
      if (updates.relationships) this.relationships = { ...this.relationships, ...updates.relationships };
      if (updates.tags) this.tags = updates.tags.map((tag: PostTag) => new Tag(tag));
      if (updates.bookmark) this.bookmark = updates.bookmark;
      if (updates.indexed_at) this.indexed_at = updates.indexed_at;

      this.created_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await this.save();

      Logger.debug('Updated post:', { id: this.details.id, updates });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.UPDATE_FAILED, `Failed to update post ${this.details.id}`, 500, {
        error,
        postId: this.details.id,
        updates,
      });
    }
  }

  static async insert(post: NexusPost): Promise<Post> {
    try {
      const newPost = new Post(this.toSchema(post));
      await newPost.save();
      Logger.debug('Created post:', { id: newPost.details.id });
      return newPost;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, `Failed to create post ${post.details.id}`, 500, {
        error,
        postId: post.details.id,
      });
    }
  }

  async delete(): Promise<void> {
    try {
      if (
        this.relationships.mentioned.length > 0 ||
        this.relationships.replied !== null ||
        this.relationships.reposted !== null ||
        this.tags.length > 0 ||
        this.bookmark !== null
      ) {
        this.details.content = '[DELETED]';
        await this.save();
        Logger.debug('Marked post as deleted:', { postPK: this.details.id });
      } else {
        await db.transaction('rw', Post.table, async () => {
          await Post.table.delete(this.details.id);
        });
        Logger.debug('Deleted post completely:', { postPK: this.details.id });
      }
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, `Failed to delete post ${this.details.id}`, 500, {
        error,
        postId: this.details.id,
      });
    }
  }

  static async findById(id: PostPK): Promise<Post> {
    try {
      const postData = await this.table.get(id);
      if (!postData) {
        throw createDatabaseError(DatabaseErrorType.POST_NOT_FOUND, `Post not found: ${id}`, 404, { postId: id });
      }

      Logger.debug('Found post:', { id });
      return new Post(postData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, `Failed to find post ${id}`, 500, {
        error,
        postId: id,
      });
    }
  }

  static async find(postPKs: PostPK[]): Promise<Post[]> {
    try {
      const postsData = await this.table.where('id').anyOf(postPKs).toArray();
      if (postsData.length !== postPKs.length) {
        const missingPosts = postPKs.filter((id) => !postsData.find((post) => post.id === id));
        throw createDatabaseError(
          DatabaseErrorType.POST_NOT_FOUND,
          `Failed to find all posts: ${postPKs.length - postsData.length} posts not found`,
          404,
          { missingPosts },
        );
      }
      Logger.debug('Found posts:', postsData);
      return postsData.map((postData) => new Post(postData));
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to find posts', 500, {
        error,
        postIds: postPKs,
      });
    }
  }

  static async bulkSave(posts: NexusPost[]): Promise<Post[]> {
    try {
      const postsToSave: PostSchema[] = posts.map((post) => this.toSchema(post));

      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(postsToSave);
      });

      const results = postsToSave.map((postData) => new Post(postData));
      Logger.debug('Bulk saved posts:', { posts: posts.map((post) => post.details.id) });
      return results;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save posts', 500, {
        error,
        postIds: posts.map((p) => p.details.id),
      });
    }
  }

  static async bulkDelete(postPKs: PostPK[]): Promise<void> {
    try {
      const posts = await this.table.where('id').anyOf(postPKs).toArray();
      const postsWithRelationships: PostPK[] = [];
      const postsToDelete: PostPK[] = [];

      for (const postData of posts) {
        const hasRelationships =
          postData.relationships.mentioned.length > 0 ||
          postData.relationships.replied !== null ||
          postData.relationships.reposted !== null ||
          postData.tags.length > 0 ||
          postData.bookmark !== null;

        if (hasRelationships) {
          postsWithRelationships.push(postData.id);
        } else {
          postsToDelete.push(postData.id);
        }
      }

      await db.transaction('rw', this.table, async () => {
        if (postsWithRelationships.length > 0) {
          const updates = postsWithRelationships.map((id) => ({
            key: id,
            changes: { 'details.content': '[DELETED]' },
          }));
          await this.table.bulkUpdate(updates);
        }

        if (postsToDelete.length > 0) {
          await this.table.bulkDelete(postsToDelete);
        }
      });

      Logger.debug('Bulk deleted posts:', { postPKs });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk delete posts', 500, {
        error,
        postIds: postPKs,
      });
    }
  }

  private static toSchema(post: NexusPost, overrides: Partial<PostSchema> = {}): PostSchema {
    try {
      const now = Date.now();
      return {
        id: post.details.id,
        details: post.details,
        counts: post.counts,
        relationships: post.relationships,
        tags: post.tags.map((tag) => new Tag(tag)),
        bookmark: post.bookmark || null,
        indexed_at: overrides.indexed_at ?? null,
        created_at: overrides.created_at ?? now,
        sync_status: overrides.sync_status ?? 'local',
        sync_ttl: overrides.sync_ttl ?? now + SYNC_TTL,
      } as PostSchema;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.INVALID_DATA, 'Failed to convert post to schema', 500, {
        error,
        post,
      });
    }
  }
}
