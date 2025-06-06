import {
  // type PostControllerNewData,
  type NexusPost,
  PostModelPK,
  PostModel,
  // HomeserverService,
  PostModelSchema,
} from '@/core';

export class PostController {
  private constructor() {} // Prevent instantiation

  // static async create(newPost: PostControllerNewData): Promise<PostModel> {
  //   const homeserver = HomeserverService.getInstance();
  //   const homeserverPost = await homeserver.createPost(newPost);

  //   // save post to database
  //   await PostModel.insert(homeserverPost);

  //   const post = homeserver.createPost(newPost);

  //   post.sync_status = 'homeserver';
  //   await post.save();

  //   return post;
  // }

  static async insert(postData: NexusPost | PostModelSchema): Promise<PostModel> {
    return await PostModel.insert(postData);
  }

  static async get(postPK: PostModelPK): Promise<PostModel> {
    return await PostModel.findById(postPK);
  }

  static async getByIds(postPKs: PostModelPK[]): Promise<PostModel[]> {
    return await PostModel.find(postPKs);
  }

  // postData can be a NexusPost or a PostSchema because it can come from the homeserver or the database
  static async save(postData: NexusPost | PostModelSchema): Promise<PostModel> {
    try {
      const existingPost = await PostModel.findById(postData.details.id);
      await existingPost.edit(postData);
      return existingPost;
    } catch {
      // Post doesn't exist, create new one
      return this.insert(postData);
    }
  }

  static async delete(postPK: PostModelPK): Promise<void> {
    const post = await this.get(postPK);
    return await post.delete();
  }

  static async bulkSave(postsData: NexusPost[] | PostModelSchema[]): Promise<PostModel[]> {
    return await PostModel.bulkSave(postsData);
  }

  static async bulkDelete(postPKs: PostModelPK[]): Promise<void> {
    return await PostModel.bulkDelete(postPKs);
  }
}
