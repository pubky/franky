import { logger } from '@/lib/logger';
import { type PostPK, type UserPK } from '../types';
import { type NexusPost } from '@/services/nexus/types';
import { Post } from '../model/Post';
import { type Post as PostSchema } from '../schemas/post';
import { UserController } from './user';

export class PostController {
  private constructor() {
    // Prevent instantiation
  }

  static async get(postPK: PostPK): Promise<Post> {
    const post = await Post.findById(postPK);
    if (!post) throw new Error(`Post not found: ${postPK}`);
    return post;
  }

  static async getAll(): Promise<Post[]> {
    try {
      const posts = await Post.findAll();
      logger.debug('Retrieved all posts');
      return posts;
    } catch (error) {
      logger.error('Failed to get all posts:', error);
      throw error;
    }
  }

  static async getByIds(postPKs: PostPK[]): Promise<Post[]> {
    try {
      const posts = await Promise.all(
        postPKs.map(async (id) => {
          try {
            return await this.get(id);
          } catch (error) {
            logger.warn(`Failed to get post ${id}:`, error);
            return null;
          }
        }),
      );
      return posts.filter((post): post is Post => post !== null);
    } catch (error) {
      logger.error('Failed to get posts by ids:', error);
      throw error;
    }
  }

  static async save(postData: NexusPost): Promise<Post> {
    try {
      // Validate author exists
      await UserController.get(postData.details.author);

      const existingPost = await Post.findById(postData.details.id);
      if (existingPost) {
        await existingPost.edit(postData);
        return existingPost;
      }

      // Create new post
      const newPost = await Post.create(postData);

      // Update author's post count (this should be handled by User model if needed)
      // TODO: Consider if this should be in User model or here

      return newPost;
    } catch (error) {
      logger.error('Failed to save post:', error);
      throw error;
    }
  }

  static async delete(postPK: PostPK, userPK?: UserPK): Promise<void> {
    try {
      const post = await this.get(postPK);

      // Check authorization if userPK is provided
      if (userPK && !post.canUserEdit(userPK)) {
        throw new Error(`Unauthorized: User ${userPK} is not the author of post ${postPK}`);
      }

      // If post has relationships, just mark as deleted
      if (post.hasRelationships()) {
        post.markAsDeleted();
        await post.save();
        logger.debug('Marked post as deleted:', { postPK });
      } else {
        // No relationships, safe to delete completely
        await post.delete();
        logger.debug('Deleted post completely:', { postPK });
      }
    } catch (error) {
      logger.error('Failed to delete post:', error);
      throw error;
    }
  }

  static async search(query: Partial<PostSchema>): Promise<Post[]> {
    try {
      const posts = await Post.findAll();
      return posts.filter((post) => {
        return Object.entries(query).every(([key, value]) => {
          return post[key as keyof Post] === value;
        });
      });
    } catch (error) {
      logger.error('Failed to search posts:', error);
      throw error;
    }
  }

  static async count(query?: Partial<PostSchema>): Promise<number> {
    try {
      const posts = await Post.findAll();
      if (query) {
        return posts.filter((post) => {
          return Object.entries(query).every(([key, value]) => {
            return post[key as keyof Post] === value;
          });
        }).length;
      }
      return posts.length;
    } catch (error) {
      logger.error('Failed to count posts:', error);
      throw error;
    }
  }

  static async bulkSave(postsData: NexusPost[]): Promise<Post[]> {
    const results: Post[] = [];

    await Promise.all(
      postsData.map(async (postData) => {
        try {
          const post = await this.save(postData);
          results.push(post);
        } catch (error) {
          logger.warn(`Failed to save post ${postData.details.id}:`, error);
        }
      }),
    );

    logger.debug('Bulk save operation completed:', {
      total: postsData.length,
      successful: results.length,
    });

    return results;
  }

  static async bulkDelete(postPKs: PostPK[], userPK?: UserPK): Promise<{ success: PostPK[]; failed: PostPK[] }> {
    const results = {
      success: [] as PostPK[],
      failed: [] as PostPK[],
    };

    await Promise.all(
      postPKs.map(async (postPK) => {
        try {
          await this.delete(postPK, userPK);
          results.success.push(postPK);
        } catch (error) {
          logger.warn(`Failed to delete post ${postPK}:`, error);
          results.failed.push(postPK);
        }
      }),
    );

    logger.debug('Bulk delete operation completed:', {
      total: postPKs.length,
      successful: results.success.length,
      failed: results.failed.length,
    });

    return results;
  }

  // Post-specific methods
  static async getReplies(postPK: PostPK): Promise<Post[]> {
    try {
      return await Post.findReplies(postPK);
    } catch (error) {
      logger.error('Failed to get post replies:', error);
      throw error;
    }
  }

  static async getReposts(postPK: PostPK): Promise<Post[]> {
    try {
      return await Post.findReposts(postPK);
    } catch (error) {
      logger.error('Failed to get post reposts:', error);
      throw error;
    }
  }

  static async getByAuthor(authorPK: UserPK): Promise<Post[]> {
    try {
      return await Post.findByAuthor(authorPK);
    } catch (error) {
      logger.error('Failed to get posts by author:', error);
      throw error;
    }
  }

  // TODO: Add tag, bookmark, reply, repost methods following same pattern as UserController
}
