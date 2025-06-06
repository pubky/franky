import { Table } from 'dexie';
import {
  type PostModelSchema,
  type NexusTag,
  type NexusPostDetails,
  type NexusPostCounts,
  type NexusPostRelationships,
  type PostModelPK,
  type SyncStatus,
  type Timestamp,
  type NexusBookmark,
  type NexusPost,
  db,
  TagModel,
} from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import { SYNC_TTL } from '@/config/sync';

export class PostModel implements PostModelSchema {
  private static table: Table<PostModelSchema> = db.table('posts');

  id: PostModelPK;
  details: NexusPostDetails;
  counts: NexusPostCounts;
  relationships: NexusPostRelationships;
  tags: TagModel[];
  bookmark: NexusBookmark | null;
  indexed_at: Timestamp | null;
  created_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;

  constructor(post: PostModelSchema) {
    this.id = post.details.id;
    this.details = post.details;
    this.counts = post.counts;
    this.relationships = post.relationships;
    this.tags = post.tags.map((tag: NexusTag) => new TagModel(tag));
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

      await db.transaction('rw', PostModel.table, async () => {
        await PostModel.table.put({ ...this });
      });

      Logger.debug('Saved post to database', { id: this.details.id });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, `Failed to save post ${this.details.id}`, 500, {
        error: error instanceof Error ? error.message : String(error),
        postId: this.details.id,
      });
    }
  }

  async edit(updates: Partial<PostModelSchema>): Promise<void> {
    try {
      Object.assign(this, updates);

      const now = Date.now();

      this.created_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await this.save();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.UPDATE_FAILED, `Failed to update post ${this.details.id}`, 500, {
        error,
        postId: this.details.id,
        updates,
      });
    }
  }

  // post can be NexusPost or PostSchema because it can come from the homeserver or the database
  static async insert(post: NexusPost | PostModelSchema): Promise<PostModel> {
    try {
      // check if post is a NexusPost by checking if it has a sync_status property
      const isPostSchema = 'sync_status' in post;
      if (!isPostSchema) {
        post = this.toSchema(post as NexusPost);
      }

      const newPost = new PostModel(post as PostModelSchema);
      await newPost.save();

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
        Logger.debug('Marked post as deleted', { postPK: this.details.id });
      } else {
        await db.transaction('rw', PostModel.table, async () => {
          await PostModel.table.delete(this.details.id);
        });
        Logger.debug('Deleted post completely', { postPK: this.details.id });
      }
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, `Failed to delete post ${this.details.id}`, 500, {
        error,
        postId: this.details.id,
      });
    }
  }

  static async findById(id: PostModelPK): Promise<PostModel> {
    try {
      const postData = await this.table.get(id);
      if (!postData) {
        throw createDatabaseError(DatabaseErrorType.POST_NOT_FOUND, `Post not found: ${id}`, 404, { postId: id });
      }

      Logger.debug('Found post', { id });

      return new PostModel(postData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, `Failed to find post ${id}`, 500, {
        error,
        postId: id,
      });
    }
  }

  static async find(postPKs: PostModelPK[]): Promise<PostModel[]> {
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

      Logger.debug('Found posts', postsData);

      return postsData.map((postData) => new PostModel(postData));
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to find posts', 500, {
        error,
        postIds: postPKs,
      });
    }
  }

  // posts can be NexusPost[] or PostSchema[] because it can come from the homeserver or the database
  static async bulkSave(posts: NexusPost[] | PostModelSchema[]): Promise<PostModel[]> {
    try {
      let postsToSave: PostModelSchema[];
      // check if posts are types as NexusPost
      const isPostSchema = posts.every((post) => 'sync_status' in post);
      if (!isPostSchema) {
        postsToSave = posts.map((post) => this.toSchema(post));
      } else {
        postsToSave = posts as PostModelSchema[];
      }

      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(postsToSave);
      });

      const results = postsToSave.map((postData) => new PostModel(postData));

      Logger.debug('Bulk saved posts', { posts: posts.map((post) => post.details.id) });

      return results;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save posts', 500, {
        error,
        postIds: posts.map((p) => p.details.id),
      });
    }
  }

  static async bulkDelete(postPKs: PostModelPK[]): Promise<void> {
    try {
      const posts = await this.table.where('id').anyOf(postPKs).toArray();
      const postsWithRelationships: PostModelPK[] = [];
      const postsToDelete: PostModelPK[] = [];

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

      Logger.debug('Bulk deleted posts', { postPKs });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk delete posts', 500, {
        error,
        postIds: postPKs,
      });
    }
  }

  // convert NexusPost to PostSchema
  private static toSchema(post: NexusPost, overrides: Partial<PostModelSchema> = {}): PostModelSchema {
    try {
      const now = Date.now();
      return {
        id: post.details.id,
        details: post.details,
        counts: post.counts,
        relationships: post.relationships,
        tags: post.tags.map((tag) => new TagModel(tag)),
        bookmark: post.bookmark || null,
        indexed_at: overrides.indexed_at ?? null,
        created_at: overrides.created_at ?? now,
        sync_status: overrides.sync_status ?? 'local',
        sync_ttl: overrides.sync_ttl ?? now + SYNC_TTL,
      } as PostModelSchema;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.INVALID_DATA, 'Failed to convert post to schema', 500, {
        error,
        post,
      });
    }
  }
}
