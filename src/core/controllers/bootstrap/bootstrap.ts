import * as Core from '@/core';

export class BootstrapController {
  private constructor() {} // Prevent instantiation

  static async run(userPK: string): Promise<void> {
    const data = await Core.BootstrapService.get(userPK);
    await Core.UserController.bulkSave(data.users);
    await Core.PostController.bulkSave(data.posts);
    await Core.StreamModel.create(Core.StreamTypes.TIMELINE_ALL, null, data.list.stream);
    // TODO: Pending influencers, recommended. When we will implement the right bar of the main page, implement them.
  }
}
