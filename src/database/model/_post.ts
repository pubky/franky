import { type PostPK, type Timestamp, type SyncStatus } from '@/database/types';
import { logger } from '@/lib/logger';
import { type NexusPost } from '@/services/nexus/types';
import { Table } from 'dexie';
import { db } from '@/database';
import { SYNC_TTL } from '../config';
import { type Post as PostSchema } from '../schemas/post';
import { Tag } from './shared/_tag';

import { Post as PostType } from '@/database/schemas/post';

export class Post implements NexusPost {
  private static table: Table<PostSchema> = db.table('posts');

  id: PostPK;
  details: NexusPost['details'];
  counts: NexusPost['counts'];
  relationships: NexusPost['relationships'];
  tags: Tag[];
  bookmark: PostSchema['bookmark'];
  indexed_at: Timestamp | null;
  created_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;

  constructor(post: PostType) {
    this.id = post.details.id;
    this.details = post.details;
    this.counts = post.counts;
    this.relationships = post.relationships;
    this.tags = post.tags.map((tag) => new Tag(tag));
    this.bookmark = post.bookmark;
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
          tags: this.tags.map((tag) => tag.toJSON()),
        });
      });

      logger.debug('Saved post to database:', { id: this.details.id });
    } catch (error) {
      logger.error('Failed to save post:', error);
      throw error;
    }
  }

  async edit(updates: Partial<PostType>): Promise<void> {
    try {
      const now = Date.now();

      if (updates.details) this.details = { ...this.details, ...updates.details };
      if (updates.counts) this.counts = { ...this.counts, ...updates.counts };
      if (updates.relationships) this.relationships = { ...this.relationships, ...updates.relationships };
      if (updates.tags) this.tags = updates.tags.map((tag) => new Tag(tag));
      if (updates.bookmark) this.bookmark = updates.bookmark;
      if (updates.indexed_at) this.indexed_at = updates.indexed_at;

      this.created_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await this.save();

      logger.debug('Updated post:', { id: this.details.id, updates });
    } catch (error) {
      logger.error('Failed to update post:', error);
      throw error;
    }
  }

  static async insert(post: NexusPost): Promise<Post> {
    try {
      const newPost = new Post(this.toSchema(post));

      await newPost.save();
      logger.debug('Created post:', { id: newPost.details.id });
      return newPost;
    } catch (error) {
      logger.error('Failed to create post:', error);
      throw error;
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
        logger.debug('Marked post as deleted:', { postPK: this.details.id });
      } else {
        await db.transaction('rw', Post.table, async () => {
          await Post.table.delete(this.details.id);
        });
        logger.debug('Deleted post completely:', { postPK: this.details.id });
      }
    } catch (error) {
      logger.error('Failed to delete post:', error);
      throw error;
    }
  }

  static async findById(id: PostPK): Promise<Post> {
    try {
      const postData = await this.table.get(id);
      if (!postData) throw new Error(`Post not found: ${id}`);

      logger.debug('Found post:', { id });
      return new Post(postData);
    } catch (error) {
      logger.error('Failed to find post:', error);
      throw error;
    }
  }

  static async find(postPKs: PostPK[]): Promise<Post[]> {
    try {
      const postsData = await this.table.where('id').anyOf(postPKs).toArray();
      logger.debug('Found posts:', postsData);
      if (postsData.length !== postPKs.length)
        throw new Error(`Failed to find all posts: ${postPKs.length - postsData.length} posts not found`);
      logger.debug('Found posts:', postsData);
      return postsData.map((postData) => new Post(postData));
    } catch (error) {
      logger.error('Failed to find posts:', error);
      throw error;
    }
  }

  static async bulkSave(posts: NexusPost[]): Promise<Post[]> {
    try {
      const postsToSave: PostSchema[] = posts.map((post) => this.toSchema(post));

      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(postsToSave);
      });

      const results = postsToSave.map((postData) => new Post(postData));
      logger.debug('Bulk saved posts:', { posts: posts.map((post) => post.details.id) });
      return results;
    } catch (error) {
      logger.error('Failed to bulk save posts:', error);
      throw error;
    }
  }

  static async bulkDelete(postPKs: PostPK[]): Promise<void> {
    try {
      // For bulk delete, we need to check relationships first
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
        // Mark posts with relationships as deleted
        if (postsWithRelationships.length > 0) {
          const updates = postsWithRelationships.map((id) => ({
            key: id,
            changes: { 'details.content': '[DELETED]' },
          }));
          await this.table.bulkUpdate(updates);
        }

        // Delete posts without relationships
        if (postsToDelete.length > 0) {
          await this.table.bulkDelete(postsToDelete);
        }
      });

      logger.debug('Bulk deleted posts:', { postPKs });
    } catch (error) {
      logger.error('Failed to bulk delete posts:', error);
      throw error;
    }
  }

  private static toSchema(post: NexusPost, overrides: Partial<PostSchema> = {}): PostSchema {
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
    };
  }
}
