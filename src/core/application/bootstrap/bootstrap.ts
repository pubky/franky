import * as Libs from '@/libs';
import * as Core from '@/core';

export class BootstrapApplication {
  private constructor() {}

  static async read(pubky: Core.Pubky) {
    const data = await Core.NexusBootstrapService.fetch(pubky);
    await Promise.all([
      Core.LocalStreamUsersService.persistUsers(data.users),
      Core.LocalStreamPostsService.persistPosts(data.posts),
      Core.LocalStreamPostsService.upsert(Core.PostStreamTypes.TIMELINE_ALL, data.list.stream),
      Core.LocalStreamUsersService.upsert(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, data.list.influencers),
      Core.LocalStreamUsersService.upsert(Core.UserStreamTypes.RECOMMENDED, data.list.recommended),
      Core.LocalStreamTagsService.upsert(Core.TagStreamTypes.TODAY_ALL, data.list.hot_tags),
    ]);
  }

  static async authorizeAndBootstrap(pubky: Core.Pubky) {
    let success = false;
    let retries = 0;
    while (!success && retries < 3) {
      try {
        // Wait 5 seconds before each attempt to let Nexus index the user
        Libs.Logger.info(`Waiting 5 seconds before bootstrap attempt ${retries + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await this.read(pubky);
        success = true;
      } catch (error) {
        Libs.Logger.error('Failed to bootstrap', error, retries);
        retries++;
      }
    }
    if (!success) {
      throw new Error('User still not indexed');
    }
  }
}
