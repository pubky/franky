import { type PostPK } from '../types';
import { type NexusPost } from '@/services/nexus/types';
import { Post } from '../model/Post';

export class PostController {
  private constructor() {} // Prevent instantiation

  static async get(postPK: PostPK): Promise<Post> {
    return await Post.findById(postPK);
  }

  static async getByIds(postPKs: PostPK[]): Promise<Post[]> {
    return await Post.find(postPKs);
  }

  static async save(postData: NexusPost): Promise<Post> {
    try {
      const existingPost = await Post.findById(postData.details.id);
      await existingPost.edit(postData);
      return existingPost;
    } catch {
      // Post doesn't exist, create new one
      return await Post.insert(postData);
    }
  }

  static async delete(postPK: PostPK): Promise<void> {
    const post = await this.get(postPK);
    return await post.delete();
  }

  static async bulkSave(postsData: NexusPost[]): Promise<Post[]> {
    return await Post.bulkSave(postsData);
  }

  static async bulkDelete(postPKs: PostPK[]): Promise<void> {
    return await Post.bulkDelete(postPKs);
  }
}
