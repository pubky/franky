import * as Core from '@/core';

export class ActiveUsersController {
  private constructor() {}

  /**
   * Get or fetch active users (influencers) based on reach and timeframe
   */
  static async getOrFetch(params: Core.TUserStreamInfluencersParams): Promise<Core.Pubky[]> {
    return await Core.ActiveUsersApplication.getOrFetch(params);
  }
}
