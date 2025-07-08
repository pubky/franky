import {
  type PostControllerNewData,
  type NexusPost,
  PostModelPK,
  PostModel,
  // HomeserverService,
  PostModelSchema,
  DEFAULT_NEW_POST,
  DEFAULT_POST_DETAILS,
} from '@/core';

export class PostController {
  private constructor() {} // Prevent instantiation

  static async create(newPost: PostControllerNewData): Promise<PostModel> {
    // const homeserver = HomeserverService.getInstance();

    // create post sync_status = 'local'
    const postData: PostModelSchema = {
      id: '',
      ...DEFAULT_NEW_POST,
      details: {
        ...DEFAULT_POST_DETAILS,
        ...newPost,
      },
      created_at: Date.now(),
    };

    // save post to database
    const post = await PostModel.insert(postData);

    // create post on homeserver
    // TODO: add createPost method to homeserver service
    // const result = await homeserver.createPost(postData);

    // // update post sync_status = 'homeserver'
    // post.details.uri = result.meta.url;
    // post.details.id = result.meta.id;
    // post.id = result.meta.id;
    // post.sync_status = 'homeserver';
    await post.save();

    return post;
  }

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
