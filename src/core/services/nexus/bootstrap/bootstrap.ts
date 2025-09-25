import * as Libs from '@/libs';
import * as Core from '@/core';
import * as BootstrapServiceGuard from './bootstrap.guard';

export class NexusBootstrapService {
  static async retrieveAndPersist(pubky: Core.Pubky) {
    try {
      const url = Core.buildNexusUrl(Core.BOOTSTRAP_API.GET(pubky));
      const response = await fetch(url, Core.createFetchOptions());

      BootstrapServiceGuard.ensureHttpResponseOk({ response, pubky });
      const { users, posts, list } = await BootstrapServiceGuard.parseBootstrapResponseOrThrow({ response, pubky });

      // Persist fetched data in the database
      await this.persistUsers(users);
      await this.persistPosts(posts);
      await Core.StreamModel.create(Core.StreamTypes.TIMELINE_ALL, null, list.stream);
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
    await Core.PostCountsModel.bulkSave(posts.map((post) => [post.details.id, post.counts]));
    await Core.PostDetailsModel.bulkSave(posts.map((post) => post.details));
    await Core.PostRelationshipsModel.bulkSave(posts.map((post) => [post.details.id, post.relationships]));
    await Core.PostTagsModel.bulkSave(posts.map((post) => [post.details.id, post.tags]));
  }
}
