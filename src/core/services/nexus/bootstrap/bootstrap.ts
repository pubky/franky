import * as Libs from '@/libs';
import * as Core from '@/core';
import * as BootstrapServiceGuard from './bootstrap.guard';

export class NexusBootstrapService {
  private static baseUrl = Libs.Env.NEXT_PUBLIC_NEXUS_URL;

  static async retrieveAndPersist(pubky: string) {
    try {
      const response = await fetch(`${this.baseUrl}/bootstrap/${pubky}`);

      BootstrapServiceGuard.ensureHttpResponseOk({ response, pubky });
      const { users, posts, list } = await BootstrapServiceGuard.parseBootstrapResponseOrThrow({ response, pubky });

      // Persist fetched data in the database
      await Core.UserModel.bulkSave(users);
      await Core.PostModel.bulkSave(posts);
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
}
