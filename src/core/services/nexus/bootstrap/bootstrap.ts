import * as Libs from '@/libs';
import * as Core from '@/core';

export class NexusBootstrapService {
  static async retrieveAndPersist(pubky: Core.Pubky) {
    try {
      const url = Core.buildNexusUrl(Core.BOOTSTRAP_API.GET(pubky));

      const { users, posts, list } = await Core.queryNexus<Core.NexusBootstrapResponse>(url);

      // Persist fetched data in the database
      await this.persistUsers(users);
      await this.persistPosts(posts);
      await Core.PostStreamModel.create(Core.PostStreamTypes.TIMELINE_ALL, null, list.stream);
      await Core.UserStreamModel.create(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, list.influencers);
      await Core.UserStreamModel.create(Core.UserStreamTypes.RECOMMENDED, list.recommended);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;
      // Handle network/fetch errors
      throw Libs.createNexusError(Libs.NexusErrorType.NETWORK_ERROR, 'Failed to fetch bootstrap data', 500, {
        error,
        pubky,
      });
    }
  }

  static async persistUsers(users: Core.NexusUser[]) {
    await Core.UserCountsModel.bulkSave(users.map((user) => [user.details.id, user.counts]));
    await Core.UserDetailsModel.bulkSave(users.map((user) => user.details));
    await Core.UserRelationshipsModel.bulkSave(users.map((user) => [user.details.id, user.relationship]));
    await Core.UserTagsModel.bulkSave(users.map((user) => [user.details.id, user.tags]));
  }

  static async persistPosts(posts: Core.NexusPost[]) {
    const postCounts: Core.NexusModelTuple<Core.NexusPostCounts>[] = [];
    const postRelationships: Core.NexusModelTuple<Core.NexusPostRelationships>[] = [];
    const postTags: Core.NexusModelTuple<Core.TagModel[]>[] = [];
    const postDetails: Core.RecordModelBase<string, Core.PostDetailsModelSchema>[] = [];

    for (const post of posts) {
      // post.details.id is Crockford Base32 strings derived from timestamps. If two users post at the same time, the id will be the same.
      // To avoid that, we need to use the authorId:postId format to ensure the id is unique.
      const postId = `${post.details.author}:${post.details.id}`;

      postCounts.push([postId, post.counts]);
      postRelationships.push([postId, post.relationships]);
      postTags.push([postId, post.tags]);
      // Exclude the author from the post details
      // eslint-disable-next-line
      const { author, ...detailsWithoutAuthor } = post.details;
      postDetails.push({ ...detailsWithoutAuthor, id: postId });
    }

    await Core.PostDetailsModel.bulkSave(postDetails);
    await Core.PostCountsModel.bulkSave(postCounts);
    await Core.PostTagsModel.bulkSave(postTags);
    await Core.PostRelationshipsModel.bulkSave(postRelationships);
  }
}
