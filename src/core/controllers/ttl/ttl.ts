import * as Core from '@/core';

export class TtlController {
  private constructor() {}

  static async findStalePostsByIds(params: { postIds: string[]; ttlMs: number }): Promise<string[]> {
    return await Core.TtlApplication.findStalePostsByIds(params);
  }

  static async findStaleUsersByIds(params: { userIds: Core.Pubky[]; ttlMs: number }): Promise<Core.Pubky[]> {
    return await Core.TtlApplication.findStaleUsersByIds(params);
  }

  static async forceRefreshPostsByIds(params: { postIds: string[]; viewerId: Core.Pubky }): Promise<void> {
    return await Core.TtlApplication.forceRefreshPostsByIds(params);
  }

  static async forceRefreshUsersByIds(params: { userIds: Core.Pubky[]; viewerId?: Core.Pubky }): Promise<void> {
    return await Core.TtlApplication.forceRefreshUsersByIds(params);
  }
}
