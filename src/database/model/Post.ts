import { type PostPK, type UserPK, type Timestamp, type SyncStatus } from '@/database/types';
import { logger } from '@/lib/logger';
import { type NexusPost } from '@/services/nexus/types';
import { Table } from 'dexie';
import { db } from '@/database';
import { SYNC_TTL } from '../config';
import { type Post as PostSchema } from '../schemas/post';
import { Tag } from './Tag';
import { DEFAULT_POST_COUNTS, DEFAULT_POST_RELATIONSHIPS } from '../schemas/defaults/post';

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

  constructor(
    post: NexusPost & {
      bookmark: PostSchema['bookmark'];
      indexed_at: Timestamp | null;
      created_at: Timestamp;
      sync_status: SyncStatus;
      sync_ttl: Timestamp;
    },
  ) {
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

  async delete(): Promise<void> {
    try {
      await db.transaction('rw', Post.table, async () => {
        await Post.table.delete(this.details.id);
      });

      logger.debug('Deleted post from database:', { id: this.details.id });
    } catch (error) {
      logger.error('Failed to delete post:', error);
      throw error;
    }
  }

  async edit(updates: Partial<NexusPost>): Promise<void> {
    try {
      const now = Date.now();

      // Update the instance properties
      if (updates.details) this.details = { ...this.details, ...updates.details };
      if (updates.counts) this.counts = { ...this.counts, ...updates.counts };
      if (updates.relationships) this.relationships = { ...this.relationships, ...updates.relationships };
      if (updates.tags) this.tags = updates.tags.map((tag) => new Tag(tag));

      this.created_at = now;
      this.sync_ttl = now + SYNC_TTL;

      // Save to database
      await this.save();

      logger.debug('Updated post:', { id: this.details.id, updates });
    } catch (error) {
      logger.error('Failed to update post:', error);
      throw error;
    }
  }

  // Static methods for database operations
  static async findById(id: PostPK): Promise<Post | null> {
    try {
      const postData = await this.table.get(id);
      if (!postData) return null;

      return new Post(postData);
    } catch (error) {
      logger.error('Failed to find post:', error);
      throw error;
    }
  }

  static async findAll(): Promise<Post[]> {
    try {
      const postsData = await this.table.toArray();
      return postsData.map((postData) => new Post(postData));
    } catch (error) {
      logger.error('Failed to find all posts:', error);
      throw error;
    }
  }

  static async create(post: NexusPost): Promise<Post> {
    try {
      const now = Date.now();

      // Remove duplicate tags
      const uniqueTags = post.tags.filter((tag, index, self) => self.findIndex((t) => t.label === tag.label) === index);

      const newPost = new Post({
        ...post,
        tags: uniqueTags,
        counts: {
          ...DEFAULT_POST_COUNTS,
          tags: uniqueTags.reduce((sum, tag) => sum + tag.taggers_count, 0),
          unique_tags: uniqueTags.length,
        },
        relationships: post.relationships
          ? { ...DEFAULT_POST_RELATIONSHIPS, ...post.relationships }
          : { ...DEFAULT_POST_RELATIONSHIPS },
        bookmark: post.bookmark || null,
        indexed_at: null,
        created_at: now,
        sync_status: 'local',
        sync_ttl: now + SYNC_TTL,
      });

      await newPost.save();
      return newPost;
    } catch (error) {
      logger.error('Failed to create post:', error);
      throw error;
    }
  }

  // Post-specific methods
  static async findReplies(postId: PostPK): Promise<Post[]> {
    try {
      const repliesData = await this.table.where('relationships.replied').equals(postId).toArray();
      return repliesData.map((postData) => new Post(postData));
    } catch (error) {
      logger.error('Failed to find post replies:', error);
      throw error;
    }
  }

  static async findReposts(postId: PostPK): Promise<Post[]> {
    try {
      const repostsData = await this.table
        .where('details.kind')
        .equals('repost')
        .and((post) => post.relationships.reposted === postId)
        .toArray();
      return repostsData.map((postData) => new Post(postData));
    } catch (error) {
      logger.error('Failed to find post reposts:', error);
      throw error;
    }
  }

  static async findByAuthor(authorId: UserPK): Promise<Post[]> {
    try {
      const postsData = await this.table.where('details.author').equals(authorId).toArray();
      return postsData.map((postData) => new Post(postData));
    } catch (error) {
      logger.error('Failed to find posts by author:', error);
      throw error;
    }
  }

  // Instance methods for post operations
  canUserEdit(userId: UserPK): boolean {
    return this.details.author === userId;
  }

  hasRelationships(): boolean {
    return (
      this.relationships.mentioned.length > 0 ||
      this.relationships.replied !== null ||
      this.relationships.reposted !== null ||
      this.tags.length > 0 ||
      this.bookmark !== null
    );
  }

  markAsDeleted(): void {
    this.details.content = '[DELETED]';
  }
}
