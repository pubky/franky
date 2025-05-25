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
import { type UserPK, type UserCounts } from '../schemas/user';
import db from '@/database';
import { userModel } from './user';

export class PostModel {
  private table: Table<Post>;

  constructor() {
    this.table = db.table('posts');
  }

  private async updateUserCounts(userId: UserPK, countsUpdate: Partial<UserCounts>): Promise<void> {
    try {
      await userModel.updateCounts(userId, countsUpdate);
      logger.debug('Updated user counts:', { userId, countsUpdate });
    } catch (error) {
      logger.error('Failed to update user counts:', error);
      throw error;
    }
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

      await db.transaction('rw', [this.table, db.table('users')], async () => {
        await this.table.add(newPost);
        
        // Update user's post count
        const user = await userModel.getUser(post.details.author);
        if (user) {
          await this.updateUserCounts(post.details.author, {
            posts: user.counts.posts + 1
          });
        }
      });

      logger.debug('Created new post:', { id: newPost.id });
      return newPost;
    } catch (error) {
      logger.error('Failed to create post:', error);
      throw error;
    }
  }

  async delete(id: PostPK): Promise<void> {
    try {
      await db.transaction('rw', [this.table, db.table('users')], async () => {
        // Get post data before deleting
        const post = await this.table.get(id);
        if (!post) return;

        // Get user data before deleting the post
        const user = await userModel.getUser(post.details.author);
        if (!user) return;

        // Delete the post first
        const deleteCount = await this.table.where('id').equals(id).delete();
        if (deleteCount === 0) return;

        // Update user counts
        const countsUpdate: Partial<UserCounts> = {
          posts: Math.max(0, user.counts.posts - 1)
        };

        // If post was bookmarked, update bookmark count
        if (post.bookmarked) {
          countsUpdate.bookmarks = Math.max(0, user.counts.bookmarks - 1);
        }

        // Update tag counts
        if (post.tags.length > 0) {
          countsUpdate.tags = Math.max(0, user.counts.tags - post.counts.tags);
          countsUpdate.unique_tags = Math.max(0, user.counts.unique_tags - post.counts.unique_tags);
        }

        await this.updateUserCounts(post.details.author, countsUpdate);
      });

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
      await db.transaction('rw', [this.table, db.table('users')], async () => {
        // First get the post
        const existingPost = await this.table.get(id);
        if (!existingPost) return;

        // Then verify both users exist
        const [tagger, author] = await Promise.all([
          userModel.getUser(from_pk),
          userModel.getUser(existingPost.details.author)
        ]);

        if (!tagger || !author) return;

        let tagDelta = 0;
        let uniqueTagDelta = 0;

        // Update post tags
        await this.table.where('id').equals(id).modify(post => {
          if (action === 'PUT') {
            const existingTag = post.tags.find(t => t.label === label);
            if (existingTag) {
              if (!existingTag.taggers.includes(from_pk)) {
                existingTag.taggers.push(from_pk);
                existingTag.taggers_count++;
                post.counts.tags++;
                tagDelta = 1;
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
              tagDelta = 1;
              uniqueTagDelta = 1;
            }
          } else {
            const tagIndex = post.tags.findIndex(t => t.label === label);
            if (tagIndex >= 0) {
              const tag = post.tags[tagIndex];
              tag.taggers = tag.taggers.filter(id => id !== from_pk);
              tag.taggers_count--;
              post.counts.tags = Math.max(0, post.counts.tags - 1);
              tagDelta = -1;

              if (tag.taggers.length === 0) {
                post.tags.splice(tagIndex, 1);
                post.counts.unique_tags = Math.max(0, post.counts.unique_tags - 1);
                uniqueTagDelta = -1;
              }
            }
          }
          post.updated_at = Date.now();
        });

        // Update user's tag counts
        if (tagDelta !== 0 || uniqueTagDelta !== 0) {
          await this.updateUserCounts(existingPost.details.author, {
            tags: Math.max(0, author.counts.tags + tagDelta),
            unique_tags: Math.max(0, author.counts.unique_tags + uniqueTagDelta)
          });
        }
      });

      logger.debug('Updated post tag:', { action, from_pk, id, label });
    } catch (error) {
      logger.error('Failed to update post tag:', error);
      throw error;
    }
  }

  async bookmark(action: 'PUT' | 'DEL', from_pk: UserPK, id: PostPK): Promise<void> {
    try {
      await db.transaction('rw', [this.table, db.table('users')], async () => {
        const post = await this.table.get(id);
        if (!post) return;

        // Update post's bookmark status
        await this.table.where('id').equals(id).modify(post => {
          post.bookmarked = action === 'PUT';
          post.updated_at = Date.now();
        });

        // Update user's bookmark count
        const user = await userModel.getUser(from_pk);
        if (user) {
          await this.updateUserCounts(from_pk, {
            bookmarks: Math.max(0, user.counts.bookmarks + (action === 'PUT' ? 1 : -1))
          });
        }
      });

      logger.debug('Updated post bookmark:', { action, from_pk, id });
    } catch (error) {
      logger.error('Failed to update post bookmark:', error);
      throw error;
    }
  }

  async repost(id: PostPK, content: string): Promise<void> {
    try {
      await db.transaction('rw', [this.table, db.table('users')], async () => {
        // Get original post and user
        const originalPost = await this.table.get(id);
        if (!originalPost) return;

        const user = await userModel.getUser(originalPost.details.author);
        if (!user) return;

        // Update original post's repost count
        const updateCount = await this.table.where('id').equals(id).modify(post => {
          post.counts.reposts++;
          post.updated_at = Date.now();
        });

        if (updateCount === 0) return;

        // Create repost
        const timestamp = Date.now();
        const repostPost: Post = {
          id: `${originalPost.details.author}:repost-${timestamp}-${originalPost.counts.reposts}`,
          details: {
            attachments: [],
            author: originalPost.details.author,
            content: content,
            kind: 'repost',
            uri: `repost://${id}`,
            indexed_at: timestamp,
          },
          counts: { ...DEFAULT_POST_COUNTS },
          relationships: { 
            ...DEFAULT_POST_RELATIONSHIPS,
            repost: id,
          },
          tags: [],
          bookmarked: false,
          indexed_at: null,
          updated_at: timestamp,
          sync_status: 'local',
          sync_ttl: timestamp + DEFAULT_SYNC_TTL,
        };

        // Add repost
        await this.table.add(repostPost);
      });

      logger.debug('Created repost:', { id, content });
    } catch (error) {
      logger.error('Failed to create repost:', error);
      throw error;
    }
  }

  async reply(id: PostPK, comment: string): Promise<void> {
    try {
      await db.transaction('rw', [this.table, db.table('users')], async () => {
        // Get original post and user
        const originalPost = await this.table.get(id);
        if (!originalPost) return;

        const user = await userModel.getUser(originalPost.details.author);
        if (!user) return;

        // Update original post's reply count
        const updateCount = await this.table.where('id').equals(id).modify(post => {
          post.counts.replies++;
          post.updated_at = Date.now();
        });

        if (updateCount === 0) return;

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

        // Add reply post and update user counts
        await Promise.all([
          this.table.add(replyPost),
          this.updateUserCounts(originalPost.details.author, {
            replies: user.counts.replies + 1
          })
        ]);
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

  async getReposts(id: PostPK): Promise<Post[]> {
    try {
      const reposts = await this.table
        .where('details.kind')
        .equals('repost')
        .and(post => post.relationships.repost === id)
        .toArray();
      return reposts;
    } catch (error) {
      logger.error('Failed to get post reposts:', error);
      throw error;
    }
  }

  async getAllReposts(): Promise<Post[]> {
    try {
      const reposts = await this.table
        .where('details.kind')
        .equals('repost')
        .toArray();
      return reposts;
    } catch (error) {
      logger.error('Failed to get all reposts:', error);
      throw error;
    }
  }
}

export const postModel = new PostModel(); 