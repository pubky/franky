import { Table } from 'dexie';
import { logger } from '@/lib/logger';
import {
  type Post,
  type PostPK,
  type PostDetails,
  type TagDetails,
  DEFAULT_POST_COUNTS,
  DEFAULT_POST_RELATIONSHIPS,
  DEFAULT_SYNC_TTL,
} from '../schemas/post';
import { type UserPK } from '../schemas/user';
import db from '@/database';
import { userModel } from './user';

export class PostModel {
  private table: Table<Post>;

  constructor() {
    this.table = db.table('posts');
  }

  // Static Methods (MUTATIONS)

  async new(post: Post): Promise<Post> {
    try {
      const now = Date.now();
      const newPost: Post = {
        ...post,
        counts: { ...DEFAULT_POST_COUNTS },
        relationships: { ...DEFAULT_POST_RELATIONSHIPS },
        tags: [],
        bookmarked: false,
        indexed_at: null,
        updated_at: now,
        sync_status: 'local',
        sync_ttl: now + DEFAULT_SYNC_TTL,
      };

      await this.table.add(newPost);
      logger.debug('Created new post:', { id: newPost.id });
      return newPost;
    } catch (error) {
      logger.error('Failed to create post:', error);
      throw error;
    }
  }

  async delete(id: PostPK): Promise<void> {
    try {
      await this.table.delete(id);
      logger.debug('Deleted post:', { id });
    } catch (error) {
      logger.error('Failed to delete post:', error);
      throw error;
    }
  }

  async edit(id: PostPK, details: Partial<PostDetails>): Promise<void> {
    try {
      await this.table.where('id').equals(id).modify(post => {
        post.details = { ...post.details, ...details };
        post.updated_at = Date.now();
      });
      logger.debug('Updated post details:', { id, details });
    } catch (error) {
      logger.error('Failed to edit post:', error);
      throw error;
    }
  }

  async tag(action: 'PUT' | 'DEL', from_pk: UserPK, id: PostPK, label: string): Promise<void> {
    try {
      await this.table.where('id').equals(id).modify(post => {
        if (action === 'PUT') {
          const existingTag = post.tags.find(t => t.label === label);
          if (existingTag) {
            if (!existingTag.taggers.includes(from_pk)) {
              existingTag.taggers.push(from_pk);
              existingTag.taggers_count++;
              post.counts.tags++;
            }
          } else {
            post.tags.push({
              label,
              relationship: false,
              taggers: [from_pk],
              taggers_count: 1
            });
            post.counts.tags++;
            post.counts.unique_tags++;
          }
        } else {
          const tagIndex = post.tags.findIndex(t => t.label === label);
          if (tagIndex >= 0) {
            const tag = post.tags[tagIndex];
            tag.taggers = tag.taggers.filter(id => id !== from_pk);
            tag.taggers_count--;
            post.counts.tags = Math.max(0, post.counts.tags - 1);

            if (tag.taggers.length === 0) {
              post.tags.splice(tagIndex, 1);
              post.counts.unique_tags = Math.max(0, post.counts.unique_tags - 1);
            }
          }
        }
        post.updated_at = Date.now();
      });
      logger.debug('Updated post tag:', { action, from_pk, id, label });
    } catch (error) {
      logger.error('Failed to update post tag:', error);
      throw error;
    }
  }

  async bookmark(action: 'PUT' | 'DEL', from_pk: UserPK, id: PostPK): Promise<void> {
    try {
      // Update post's bookmark status
      await this.table.where('id').equals(id).modify(post => {
        post.bookmarked = action === 'PUT';
        post.updated_at = Date.now();
      });

      // Update user's bookmark count using userModel
      const user = await userModel.getUser(from_pk);
      if (user) {
        const newBookmarkCount = Math.max(0, user.counts.bookmarks + (action === 'PUT' ? 1 : -1));
        await userModel.updateCounts(from_pk, { bookmarks: newBookmarkCount });
      }

      logger.debug('Updated post bookmark:', { action, from_pk, id });
    } catch (error) {
      logger.error('Failed to update post bookmark:', error);
      throw error;
    }
  }

  async repost(id: PostPK, content: string): Promise<void> {
    try {
      await this.table.where('id').equals(id).modify(post => {
        post.counts.reposts++;
        post.relationships.repost = content;
        post.updated_at = Date.now();
      });
      logger.debug('Updated post repost:', { id, content });
    } catch (error) {
      logger.error('Failed to update post repost:', error);
      throw error;
    }
  }

  async reply(id: PostPK, comment: string): Promise<void> {
    try {
      await db.transaction('rw', this.table, async () => {
        // Update original post
        const originalPost = await this.table.get(id);
        if (!originalPost) return;

        await this.table.where('id').equals(id).modify(post => {
          post.counts.replies++;
          post.updated_at = Date.now();
        });

        // Get current reply count to use as a counter
        const currentReplies = await this.getReplies(id);
        const replyCount = currentReplies.length;

        // Create reply post
        const timestamp = Date.now();
        const replyPost: Post = {
          id: `${originalPost.details.author}:reply-${timestamp}-${replyCount}`,
          details: {
            attachments: [],
            author: originalPost.details.author,
            content: comment,
            kind: 'reply',
            uri: `reply://${id}`,
            indexed_at: timestamp,
          },
          counts: { ...DEFAULT_POST_COUNTS },
          relationships: { 
            ...DEFAULT_POST_RELATIONSHIPS,
            replied: id,
          },
          tags: [],
          bookmarked: false,
          indexed_at: null,
          updated_at: timestamp,
          sync_status: 'local',
          sync_ttl: timestamp + DEFAULT_SYNC_TTL,
        };
        await this.table.add(replyPost);
      });
      logger.debug('Updated post reply:', { id, comment });
    } catch (error) {
      logger.error('Failed to update post reply:', error);
      throw error;
    }
  }

  // Static Methods (REQUESTS)

  async getPost(id: PostPK): Promise<Post | null> {
    try {
      const post = await this.table.get(id);
      logger.debug('Retrieved post:', { id });
      return post || null;
    } catch (error) {
      logger.error('Failed to get post:', error);
      throw error;
    }
  }

  async getTags(id: PostPK, skip = 0, limit = 20): Promise<TagDetails[]> {
    try {
      const post = await this.table.get(id);
      if (!post) return [];
      return post.tags.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get post tags:', error);
      throw error;
    }
  }

  async getTaggers(id: PostPK, label: string): Promise<UserPK[]> {
    try {
      const post = await this.table.get(id);
      if (!post) return [];
      const tag = post.tags.find(t => t.label === label);
      return tag?.taggers || [];
    } catch (error) {
      logger.error('Failed to get post taggers:', error);
      throw error;
    }
  }

  async getReplies(id: PostPK): Promise<Post[]> {
    try {
      const replies = await this.table
        .where('relationships.replied')
        .equals(id)
        .toArray();
      return replies;
    } catch (error) {
      logger.error('Failed to get post replies:', error);
      throw error;
    }
  }
}

export const postModel = new PostModel(); 