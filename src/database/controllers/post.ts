import { Table } from 'dexie';
import { logger } from '@/lib/logger';
import { type Post, type TagDetails } from '../schemas/post';
import { type UserCounts, User } from '../schemas/user';
import { db } from '@/database';
import { UserController } from './user';
import { HomeserverActions, PostPK, UserPK, PaginationParams } from '../types';
import { DEFAULT_POST_COUNTS, DEFAULT_POST_RELATIONSHIPS, DEFAULT_PAGINATION } from '../defaults';
import { SYNC_TTL } from '../config';
import { NexusPost } from '@/services/nexus/types';

export class PostController {
  private static table: Table<Post> = db.table('posts');
  private static userTable: Table<User> = db.table('users');

  private constructor() {
    // Prevent instantiation
  }

  static async checkIfPostExists(id: PostPK): Promise<Post> {
    const post = await this.table.get(id);
    if (!post) throw new Error(`Post not found: ${id}`);
    return post;
  }

  static async authorizePostAction(userPK: UserPK, id: PostPK): Promise<{ post: Post; user: User }> {
    const post = await this.checkIfPostExists(id);
    const user = await UserController.checkIfUserExists(userPK);

    if (post?.details.author !== userPK)
      throw new Error(`Unauthorized: User ${userPK} is not the author of post ${id}`);

    return { post, user };
  }

  static async create(post: NexusPost): Promise<Post> {
    try {
      // Validate user exists
      const user = await UserController.checkIfUserExists(post.details.author);

      // prevent duplicate tags
      const uniqueTags = post.tags.filter((t, index, self) => self.indexOf(t) === index);

      // create new post
      const now = Date.now();

      const newPost: Post = {
        id: post.details.id,
        details: {
          ...post.details,
          author: user.id,
          indexed_at: now,
        },
        counts: {
          ...DEFAULT_POST_COUNTS,
          tags: uniqueTags.length,
          unique_tags: uniqueTags.length,
        },
        relationships: { ...DEFAULT_POST_RELATIONSHIPS },
        tags: uniqueTags,
        bookmark: null,
        indexed_at: null, // TODO
        created_at: now, // TODO
        sync_status: 'local', // TODO
        sync_ttl: now + SYNC_TTL,
      };

      await db.transaction('rw', [this.table, this.userTable], async () => {
        await this.table.add(newPost);

        // Update user's post count
        await UserController.updateCounts(user.id, {
          posts: user.counts.posts + 1,
          tagged: user.counts.tagged + uniqueTags?.length,
        });
      });

      logger.debug('Created new post:', { id: newPost.id });
      return newPost;
    } catch (error) {
      logger.error('Failed to create post:', error);
      throw error;
    }
  }

  static async delete(userPK: UserPK, id: PostPK): Promise<void> {
    try {
      // Validate user exists and owns the post
      const post = await this.checkIfPostExists(id);
      const user = await UserController.checkIfUserExists(userPK);

      if (post.details.author !== userPK) {
        throw new Error(`Unauthorized: User ${userPK} is not the author of post ${id}`);
      }

      // delete the post from indexedDB
      await db.transaction('rw', [this.table, this.userTable], async () => {
        // Check if post relationships are empty
        // No mentions, no replies, no reposts, no tags, no bookmarks
        if (
          post.relationships.mentioned.length === 0 &&
          post.relationships.replied === null &&
          post.relationships.reposted === null &&
          post.tags.length === 0 &&
          post.bookmark === null
        ) {
          // Update user post count
          const countsUpdate: Partial<UserCounts> = {
            posts: Math.max(0, user.counts.posts - 1),
          };
          await UserController.updateCounts(userPK, countsUpdate);

          // delete the post from indexedDB
          await this.table.delete(id);

          logger.debug('Deleted post from indexedDB:', { id });
          return;
        }

        // change the content of the post to '[DELETED]'
        await this.table
          .where('id')
          .equals(id)
          .modify((post) => {
            post.details.content = '[DELETED]';
          });
      });

      logger.debug('Deleted post [DELETED]:', { id });
    } catch (error) {
      logger.error('Failed to delete post:', error);
      throw error;
    }
  }

  static async tag(action: HomeserverActions, fromPK: UserPK, id: PostPK, label: string): Promise<void> {
    try {
      await db.transaction('rw', [this.table, this.userTable], async () => {
        const post = await this.checkIfPostExists(id);
        const author = await UserController.checkIfUserExists(post.details.author);
        const tagger = await UserController.checkIfUserExists(fromPK);

        // Update post tags
        await this.table
          .where('id')
          .equals(id)
          .modify((p) => {
            if (action === 'PUT') {
              // PUT TAG
              const existingTag = p.tags.find((t) => t.label === label);
              if (existingTag) {
                // Check if the tagger is not already in the taggers array
                if (!existingTag.taggers.includes(tagger.id)) {
                  existingTag.taggers.push(tagger.id);
                  existingTag.taggers_count++;
                  p.counts.tags++;
                }
              } else {
                p.tags.push({
                  label,
                  relationship: false,
                  taggers: [tagger.id],
                  taggers_count: 1,
                });
                p.counts.tags++;
              }
            } else {
              // DELETE TAG
              // Check if the tag exists
              const tagIndex = p.tags.findIndex((t) => t.label === label);
              if (tagIndex >= 0) {
                // Check if the tagger is in the taggers array and remove it
                const tag = p.tags[tagIndex];
                tag.taggers = tag.taggers.filter((id) => id !== tagger.id);

                // Decrement the taggers count
                tag.taggers_count--;

                // Decrement the tags count
                p.counts.tags = Math.max(0, p.counts.tags - 1);

                // If the tag has no taggers, remove the tag
                if (tag.taggers.length === 0) {
                  p.tags.splice(tagIndex, 1);
                }
              }
            }

            // Update the post counts
            p.counts.unique_tags = p.tags.length;
            p.sync_status = 'local';
            p.created_at = Date.now();
          });

        // Update author tagged counts
        await UserController.updateCounts(author.id, {
          tagged: Math.max(0, author.counts.tagged + (action === 'PUT' ? 1 : -1)),
        });
      });

      logger.debug('Updated post tag:', { action, fromPK, id, label });
    } catch (error) {
      logger.error('Failed to update post tag:', error);
      throw error;
    }
  }

  static async bookmark(action: HomeserverActions, fromPK: UserPK, id: PostPK): Promise<void> {
    try {
      await db.transaction('rw', [this.table, this.userTable], async () => {
        const user = await UserController.checkIfUserExists(fromPK);

        // Update post's bookmark status
        await this.table
          .where('id')
          .equals(id)
          .modify((post) => {
            post.bookmark = action === 'PUT' ? { created_at: Date.now(), updated_at: Date.now() } : null;
            post.sync_status = 'local';
            post.created_at = Date.now();
          });

        // Update user's bookmark count
        await UserController.updateCounts(user.id, {
          bookmarks: Math.max(0, user.counts.bookmarks + (action === 'PUT' ? 1 : -1)),
        });
      });

      logger.debug('Updated post bookmark:', { action, fromPK, id });
    } catch (error) {
      logger.error('Failed to update post bookmark:', error);
      throw error;
    }
  }

  static async edit(): Promise<void> {
    // TODO: insert this method when we have a way to edit a post
  }

  static async repost(): Promise<void> {
    // TODO: insert this method when we have a way to repost a post
  }

  static async reply(): Promise<void> {
    // TODO: insert this method when we have a way to reply to a post
  }

  static async getPost(id: PostPK): Promise<Post> {
    const post = await this.checkIfPostExists(id);
    logger.debug('Retrieved post:', { id });
    return post;
  }

  static async getTags(id: PostPK, pagination: PaginationParams = DEFAULT_PAGINATION): Promise<TagDetails[]> {
    const post = await this.checkIfPostExists(id);
    const { skip, limit } = { ...DEFAULT_PAGINATION, ...pagination };
    logger.debug('Retrieved post tags:', { id });
    return post.tags.slice(skip, skip + limit);
  }

  static async getTaggers(id: PostPK, label: string): Promise<UserPK[]> {
    const post = await this.checkIfPostExists(id);
    const tag = post.tags.find((t) => t.label === label);
    logger.debug('Retrieved post taggers:', { id, label });
    return tag?.taggers || [];
  }

  static async getReplies(id: PostPK): Promise<Post[]> {
    const replies = await this.table.where('relationships.replied').equals(id).toArray();
    logger.debug('Retrieved post replies:', { id });
    return replies;
  }

  static async getReposts(id: PostPK): Promise<Post[]> {
    const reposts = await this.table
      .where('details.kind')
      .equals('repost')
      .and((post) => post.relationships.reposted === id)
      .toArray();
    logger.debug('Retrieved post reposts:', { id });
    return reposts;
  }
}
